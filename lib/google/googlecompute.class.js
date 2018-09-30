const chalk = require('chalk');
// TODO: This should be done via the dependencies/package.json.

/**
 * @class Interfaces with GCP for all compute related functionality.
 */
class GoogleCompute {
    /**
     * @param {String} project The project name to associate with the instance.
     * @param {String} name The name of the compute instance.
     * @param {String} stage The stage of the project.  Typically `production`,
     * `staging` or `development`.
     * @param {String} imageName The name of the tagged Docker image.
     * @param {String} zone The name of the zone in which to allocate the 
     * instance.
     * @param {String} zoneLetter The zone letter for the instance.
     * @param {String} ports The ports to oen for this compute instance.
     * @param {Array<Number>|Number} ports The port numbers to open.  If no 
     * ports provided, then ALL ports are opened.
     */
    constructor(project, name, stage, imageName, zone, zoneLetter, ports) {
        this.configs = {
            docker: JSON.parse(require('fs').readFileSync(__dirname + 
                '/../docker/configs/docker.json', 'utf8')),
            google: JSON.parse(require('fs').readFileSync(__dirname + 
                '/configs/google.json', 'utf8'))
        };
        if (!project) {
            project = this.configs['google']['project'];
        }
        this.project = project;
        if (!name) {
            name = this.configs['google']['computeName'];
        }
        this.name = name;
        if (!stage) {
            stage = this.configs['google']['stage'];
        }
        this.stage = stage;
        if (!imageName) {
            imageName = this.configs['docker']['imageName'];
        }
        this.imageName = imageName;
        if (!zone) {
            zone = this.configs['google']['zone'];
        }
        this.zone = zone;
        if (!zoneLetter) {
            zoneLetter = this.configs['google']['zoneLetter'];
        }
        this.zoneLetter = zoneLetter;
        if (!ports) {
            ports = this.configs['google']['ports'];
        }
        this.ports = ports;
    }

    /**
     * Opens the specified ports.
     */
    createFirewallRules() {
        // TODO: This function should wipe existing firewall rules before creating.
        let ports = this.ports;
        let portStr = '';
        if (!Array.isArray(ports)) {
            ports = [ports];
        }
        ports.map((port) => {
            portStr += `tcp:${port},`;
        });
        if (portStr.length == 0) {
            portStr = 'tcp ';
        }
        portStr = portStr.substr(0, portStr.length - 1);
        try {
            require('child_process').execSync(`gcloud compute firewall-rules ` +
                `create ${this.getName()} --allow=${portStr}`);
            console.log(chalk.green(`Success creating firewall rules.`));
            return true;
        } catch(e) {
            console.log(chalk.red(`Error occurred creating firewall rules.`));
            return false;
        }
    }

    /**
     * Creates a compute instance.  This uses either the supplied parameters
     * OR it uses the configs supplied.
     */
    createInstance() {
        const stageHyphen = this.stage.length > 0 ? '-' : '';
        const imageLink = `gcr.io/${this.project}/${this.imageName + stageHyphen + this.stage}`;
        let ip = this.getStaticIP();
        if (!ip) {
            this.createStaticIP();
            ip = this.getStaticIP();
        }
        try {
            require('child_process').execSync(`gcloud beta compute instances ` +
                `create-with-container ${this.getName()} ` +
                `--container-image ${imageLink} ` +
                `--zone ${this.zone}-${this.zoneLetter} ` +
                `--address ${this.getStaticIP()} `);
            console.log(chalk.green(`Success creating instance: ` +
                `${this.getName()}.`));
            return true;
        } catch(e) {
            console.log(chalk.red(`Error occurred creating instance ` +
                `${this.getName()}.`));
            return false;
        }
    }

    /**
     * Creates a static IP address.
     */
    createStaticIP() {
        try {
            require('child_process').execSync(`gcloud compute addresses create ` +
                `${this.getName()} --region ${this.zone}`);
            console.log(chalk.green(`Success creating static IP.`));
            return this.getStaticIP();
        } catch(e) {
            console.log(chalk.red(`Error occurred creating static IP.`));
            return false;
        }
    }

    /**
     * Delets all firewall rules associated with the account.
     */
    deleteFirewallRules() {
        try {
            require('child_process').execSync(`gcloud compute firewall-rules ` +
                `delete ${this.getName()}`);
            console.log(chalk.green(`Success deleting firewall rules.`));
            return true;
        } catch(e) {
            console.log(chalk.red(`Error occurred deleting firewall rules.`));
            return false;
        }
    }

    /**
     * Deletes the compute instance.
     */
    deleteInstance() {
        try {
            require('child_process').execSync(`gcloud beta compute instances ` +
                `delete ${this.getName()} ` +
                `--zone ${this.zone}-${this.zoneLetter}`);
            console.log(chalk.green(`Success deleting instance: ` +
                `${this.getName()}.`));
            return true;
        } catch(e) {
            console.log(chalk.red(`Error occurred deleting instance ` +
                `${this.getName()}.`));
            return false;
        }
    }

    /**
     * Deallocates a reserved IP address.
     */
    deleteStaticIP() {
        try {
            require('child_process').execSync(`gcloud compute addresses delete ` +
                `${this.getName()} --region ${this.zone}`);
            console.log(chalk.green(`Success deleting static IP.`));
            return true;
        } catch(e) {
            console.log(chalk.red(`Error occurred deleting static IP.`));
            return false;
        }
    }

    /**
     * Opens the specified ports.
     */
    getFirewallRules() {
        try {
            return (new Buffer(require('child_process')
                .execSync(`gcloud compute firewall-rules ` +
                `describe ${this.getName()}`))).toString('utf8');
        } catch(e) {
            console.log(chalk.red(`Error getting firewall rules.`));
            return false;
        }
    }

    /**
     * Returns a properly formatted name.
     */
    getName() {
        const stageHyphen = this.stage.length > 0 ? '-' : '';
        const nameHyphen = this.name.length > 0 ? '-' : '';
        return this.project + nameHyphen + this.name + stageHyphen + this.stage;
    }

    /**
     * Gets the static IP given the project/stage/zone.
     */
    getStaticIP() {
        try {
            return (new Buffer(require('child_process')
                .execSync(`gcloud compute addresses ` +
                `describe ${this.getName()} ` + 
                `--region ${this.zone}`))).toString('utf8').split('\n')[0]
                .split('address: ')[1].trim();
        } catch(e) {
            return false;
        }
    }

    /**
     * Starts the instance.
     */
    startInstance() {

    }

    /**
     * Update the desired compute instance with the latest container.
     */
    updateInstance() {
        const stageHyphen = this.stage.length > 0 ? '-' : '';
        const imageLink = `gcr.io/${this.project}/${this.imageName + stageHyphen + this.stage}`;
        try {
            require('child_process').execSync(`gcloud beta compute instances ` +
                `update-container ${this.getName()} ` +
                `--container-image ${imageLink} ` +
                `--container-privileged ` +
                `--zone ${this.zone}-${this.zoneLetter}`);
            console.log(chalk.green(`Success updating instance: ` +
                `${this.getName()}.`));
            return true;
        } catch(e) {
            console.log(chalk.red(`Error occurred updating instance ` +
                `${this.getName()}.`));
            return false;
        }
    }
}

module.exports = GoogleCompute;