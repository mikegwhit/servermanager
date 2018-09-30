const chalk = require('chalk');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
class DockerMachine {
    constructor() {
        if (DockerMachine.instance) {
            return DockerMachine.instance;
        }
        DockerMachine.instance = this;
        this.configs = {
            docker: JSON.parse(require('fs').readFileSync(__dirname + 
                '/configs/docker.json', 'utf8'))
        };
    }

    /** 
     * Creates a machine.
     * @todo Make cross-compatible.
     * @param {String} machineName The name of the new machine.
     */
    createMachine(machineName) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        let windowsOptions = '';
        if (process.platform === 'win32') {
            windowsOptions = `-d virtualbox \
            --virtualbox-cpu-count=2 --virtualbox-memory=2048 \
            --virtualbox-disk-size=40000`;
        }
        try {
            execSync(`docker-machine create ${windowsOptions} ${machineName}`, {
                stdio: 'inherit'
            });
            console.log(chalk.green('Success creating Docker machine.'), machineName);
        } catch(e) {
            console.error(chalk.red('Error creating Docker machine.'), machineName, e); 
        }
        if (process.platform === 'win32') {
            this.windowsSetupMount();
        }
    }

    /**
     * Gets the environment for the machine name provided.  Sets these env 
     * variables to the process.
     * @param {String} machineName
     */
    getEnv(machineName) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        const envString = (new Buffer(require('child_process')
            .execSync(`docker-machine env ${machineName}`))).toString('utf8');
                    
        const env = {};
        // Next, extract the docker-machine env variables into an object.
        envString.split('\n').map((opt) => {
            let [key, val] = opt.substr(3).split('=');
            key = key.trim();
            if (val && opt.substr(0, 3) != 'REM') {
                env[key] = val;
            } else {
                return;
            }
            if (key.trim() == 'DOCKER_CERT_PATH') {
                env[key] = env[key].replace(/\\/g, '/');
            }
            if (key.trim() == 'DOCKER_TLS_VERIFY') {
                env[key] = 1
            }
            process.env[key] = env[key];
        });

        return process.env;
    }

    /**
     * Gets the IP address of the machine.
     */
    getIPAddress(machineName) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        const ip = (new Buffer(execSync(`docker-machine ls \
            -f "{{.Name}}|{{.URL}}"`))).toString('utf8')
            .split(/\n/g).reduce((acc, machine) => {
                if (machine.split('|')[0] == machineName) {
                    acc = machine.split('|')[1].split(':')[1].substr(2).replace(/\n/g, '').trim();
                }
                return acc;
            }, false);
        if (!ip) {
            console.warn(chalk
                .yellow('IP of machine requested when machine is not running.'), 
                machineName);
        }
        return ip;
    }

    /**
     * Checks if machine exists.
     * @param {String} machineName The name to check for.
     * @returns {Boolean} True if machine exists.
     */
    hasMachine(machineName) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        return (new Buffer(execSync(`docker-machine ls -f "{{.Name}}"`)))
            .toString('utf8').split(/\n/g).includes(machineName);
    }

    /**
     * @returns {Boolean} True if running.
     */
    isMachineRunning(machineName) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        return (new Buffer(execSync(`docker-machine ls -f "{{.Name}}|{{.State}}"`)))
            .toString('utf8').split(/\n/g).reduce((acc, row) => {
                if (row.split('|')[0] == machineName && 
                    row.split('|')[1] == 'Running') {
                        acc = true;
                    }
                return acc;
            }, false);
    }

    /**
     * Removes a machine.
     * @param {String} machineName The name to remove.
     */
    remove(machineName) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        execSync(`docker-machine rm -y ${machineName}`);
    }

    /**
     * Starts the machine.  If machine does not exist, creates the machine.
     */
    start(machineName) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        if (!this.hasMachine(machineName)) {
            console.warn(chalk
                .yellow('Docker machine doesn\'t exist, creating machine.'));
            this.createMachine(machineName);
        }
        if (this.isMachineRunning(machineName)) {
            console.warn(chalk.yellow('Docker machine already running.'), 
                machineName);
            return;
        }
        try {
            execSync(`docker-machine start ${machineName}`, {
                stdio: 'inherit'
            });
            console.log(chalk.green('Success starting Docker machine.'), 
                machineName);
        } catch(e) {
            console.error(chalk.red('Error starting Docker machine.'), 
                machineName, e);
        }
    }

    /**
     * Stops the docker machine.
     */
    stop(machineName) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        try {
            execSync(`docker-machine stop ${machineName}`);
            console.log(chalk.green('Success stopping Docker machine.'), 
                machineName);
        } catch(e) {
            console.error(chalk.red('Error stopping Docker machine.'), 
                machineName);
        }
    }

    /**
     * Virtualizes a folder on Windows to get ready for a mount.
     * For debugging purposes, try:
     *  "C:\\Program Files\\Oracle\\VirtualBox\\VBoxManage.exe" showvminfo
     * The above command gets the current shared folders.
     * 
     * Then, try to inspect the box using docker machine:
     *  docker-machine ssh <machine-name>
     * @param {String} machineName The name of the Docker machine.
     * @param {String} virtualFolder The virtual folder directory.
     * @param {String} realFolder The real path to mount on the host filesystem.
     */
    windowsSetupMount(machineName, virtualFolder, realFolder) {
        if (!machineName) {
            machineName = this.configs['docker']['machineName'];
        }
        if (!virtualFolder) {
            virtualFolder = this.configs['docker']['rootMountFolder'];
        }
        if (!realFolder) {
            realFolder = this.configs['docker']['windowsRootMountFolder'];
        }
        if (this.isMachineRunning(machineName)) {
            execSync(`docker-machine stop ${machineName}`);
        }
        try {
            execSync(`${this.configs['docker']['windowsVBoxPath']} \
                sharedfolder add ${machineName} --name "${virtualFolder}" \
                --hostpath "${realFolder}" --automount`, {
                    stdio: 'inherit'
                });
            console.log(chalk.green('Success in creating Windows mount folder.'), virtualFolder, realFolder);
        } catch(e) {
            console.error(chalk.red('Error in creating Windows mount folder.'), virtualFolder, realFolder, e);
        }
        this.start(machineName);
    }
}

module.exports = DockerMachine;