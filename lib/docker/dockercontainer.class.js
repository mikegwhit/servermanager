const chalk = require('chalk');
const DockerMachine = new (require(__dirname + '/dockermachine.class.js'))();
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

/**
 * @class Manages the running of the Docker container.  This shall handle 
 * starting the container, network routing to the container.
 */
class DockerContainer {
    constructor() {
        if (DockerContainer.instance) {
            return DockerContainer.instance;
        }
        DockerContainer.instance = this;
        this.configs = {
            docker: JSON.parse(require('fs').readFileSync(__dirname + 
                '/configs/docker.json', 'utf8'))
        };
    }

    /**
     * Gets the IP address of the container.
     */
    getIPAddress(containerName) {
        if (!containerName) {
            containerName = this.configs['docker']['containerName'];
        }
        return (new Buffer(execSync(`docker inspect ${containerName} -f \
            "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}"`)))
            .toString('utf8').trim().replace(/\n/g, '');
    }

    /**
     * @returns {String} A CLI representation of the volumes needed for the 
     * container.
     */
    getVolumes(volumes) {
        if (!volumes) {
            volumes = this.configs['docker']['volumes'];
        }
        let rootMountFolder = this.configs['docker']['rootMountFolder'];
        if (!rootMountFolder.endsWith('/')) {
            rootMountFolder = rootMountFolder + '/';
        }
        if (process.platform == 'win32') {
            rootMountFolder = '/' + rootMountFolder;
        }
        let volumeString = ``;
        Object.keys(volumes).map((hostFolder) => {
            const folder = volumes[hostFolder];
            if (hostFolder.startsWith == '/') {
                hostFolder = hostFolder.substr(1);
            }
            volumeString += `-v ${rootMountFolder}${hostFolder}:${folder} `;
        })
        return volumeString = volumeString.substr(0, volumeString.length - 1);
    }

    /**
     * @param {String} containerName The container to check the status of.
     * @returns {Boolean} True if container is running.
     */
    isRunning(containerName) {
        if (!containerName) {
            containerName = this.configs['docker']['containerName'];
        }
        
        const runningContainers = 
            (new Buffer(execSync(`docker container ls -a --format "{{.Names}}"`)))
            .toString('utf8');
        return runningContainers.split(/\n/g).reduce((acc, name) => {
                if (name == containerName) {
                    acc = true;
                }
                return acc;
            }, false);
    }

    /**
     * Removes all known containers.
     */
    removeAll() {
        DockerMachine.getEnv();
        (new Buffer(execSync(`docker container ls -a --format "{{.ID}}"`)))
            .toString('utf8').split(/\n/g).map((id) => {
                if (id.trim().length == 0) {
                    return;
                }
                try {
                    execSync(`docker container stop ${id}`);
                    execSync(`docker container rm ${id}`);
                } catch(e) {}
            });
    }

    /**
     * Runs a container using the image name as input.  Stops all other 
     * containers using the imageName.
     * @param {String} imageName The image from which to start the container.
     */
    run(imageName, containerName, volumes) {
        DockerMachine.getEnv();
        if (this.isRunning()) {
            this.stop();
        }
        if (!imageName) {
            imageName = this.configs['docker']['imageName'];
        }
        if (!containerName) {
            containerName = this.configs['docker']['containerName'];
        }
        if (!volumes) {
            volumes = this.configs['docker']['volumes'];
        }
        if (!DockerMachine.isMachineRunning()) {
            DockerMachine.start();
        }
        const mountFolder = this.configs['docker']['mountFolder'];
        try {
            try {
                const dangling = (new Buffer(execSync(`docker images -f \
                    "dangling=true" -q`)))
                    .toString('utf8').split(/\n/g).map((id) => {
                        execSync(`docker rmi ${id}`);
                    });
            } catch(e) {}
            execSync(`docker container run -it -d ${this.getVolumes(volumes)} \
    --name ${containerName} ${imageName}`, {
                stdio: 'inherit'
            })
            console.log(chalk.green('Success in running Docker container.'));
            if (process.platform == 'win32') {
                this.windowsRoute();
            }
        } catch(e) {
            console.error(chalk.red('Error in running Docker container.'), e);
        }
    }

    /**
     * Stops the container via the containerName.
     * @param {String} containerName The name of the container to stop.
     */
    stop(containerName, doNotRemove = false) {
        if (!containerName) {
            containerName = this.configs['docker']['containerName'];
        }
        try {
            execSync(`docker container stop ${containerName}`, {
                stdio: 'inherit'
            });
            console.log(chalk.green('Success in stopping Docker container.'), containerName);
            if (doNotRemove) {
                return;
            }
            execSync(`docker container rm ${containerName}`, {
                stdio: 'inherit'
            });
            console.log(chalk.green('Success in removing Docker container.'), containerName);
        } catch(e) {
            console.error(chalk.red('Error in stopping/removing Docker container.'), containerName, e);
        }
    }

    /**
     * Adds the Windows routing table entry.  This allows the Windows host to
     * talk to the container inside VirtualBox.
     */
    windowsRoute() {
        const machine = new (require(__dirname + '/dockermachine.class.js'))();
        const machineIP = machine.getIPAddress();
        const thisIP = this.getIPAddress();
        try {
            execSync(`route add ${thisIP} MASK 255.255.255.255 ${machineIP}`);
            console.log(chalk.green('Success in creating Windows route.'), `${thisIP} -> ${machineIP}`);
        } catch(e) {
            try {
                execSync(`route delete ${thisIP}`);
                this.windowsRoute();
            } catch(e) {
                console.error(chalk.red('Failure in creating Windows route.'), `${thisIP} -> ${machineIP}`);
            }
        }
    }
}

module.exports = DockerContainer;