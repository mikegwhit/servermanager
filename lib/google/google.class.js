const chalk = require('chalk');
// TODO: This should be done via the dependencies/package.json.
/**
 * @class Interfaces with GCP.
 */
class Google {
    /**
     * @param {String} project The project to initialize with.
     */
    constructor(project) {
        if (Google.instance) {
            return Google.instance;
        }
        Google.instance = this;

        this.configs = {
            docker: JSON.parse(require('fs').readFileSync(__dirname + 
                '/../docker/configs/docker.json', 'utf8')),
            google: JSON.parse(require('fs').readFileSync(__dirname + 
                '/configs/google.json', 'utf8'))
        };

        if (!project) {
            project = this.configs['google']['project'];
        }
        this.setupEnv(project);

        if (!require('fs')
            .existsSync(`${__dirname}/keys/${this.configs['google']['project']}.json`)) {
                console.warn(chalk.yellow('Service account credentials do not exist.'),
                    'Attempting to create credentials.');
                (new (require(__dirname + '/googleiam.class.js'))()).setup();
            }
    }

    /**
     * Selects the project.  This is stored into the GCP CLI memory.
     * @param {String} project The project to switch to.
     * @todo Evaluate if Google.setup even needs this, derp derp.
     */
    setProject(project) {
        if (!project) {
            project = this.configs['google']['project'];
        }
        try {
            require('child_process').execSync(`gcloud config set project ${project}`);
            console.log(chalk.green(`Successfully selected project as ${project}.`));
        } catch(e) {console.log(chalk.red('Error occurred setting project.', e))}
    }

    /**
     * Sets up the ENV for the gcloud executable.
     * @param {String} project The project to use for authentication.
     */
    setupEnv(project) {
        if (!project) {
            project = this.configs['google']['project'];
        }
        process.env.GOOGLE_APPLICATION_CREDENTIALS = `${__dirname}/keys/${project}.json`;
    }
}
new Google();
module.exports = Google;