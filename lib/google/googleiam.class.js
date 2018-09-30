const chalk = require('chalk');
const Google = require(__dirname + '/google.class.js');
/**
 * @class Interfaces with GCP to set up a new IAM account.
 */
class GoogleIAM {
    constructor() {
        if (GoogleIAM.instance) {
            return GoogleIAM.instance;
        }
        GoogleIAM.instance = this;

        this.configs = {
            docker: JSON.parse(require('fs').readFileSync(__dirname + 
                '/../docker/configs/docker.json', 'utf8')),
            google: JSON.parse(require('fs').readFileSync(__dirname + 
                '/configs/google.json', 'utf8'))
        };
    }

    /**
     * Associates the service account with the project.
     * @param {String} project The project.
     * @param {String} username The username.
     */
    associateServiceAccountWithProject(project, username){ 
        try {
            require('child_process')
                .execSync(`gcloud projects add-iam-policy-binding ${project} ` + 
                `--member "serviceAccount:` +
                `${username}@${project}.iam.gserviceaccount.com" ` + 
                `--role "roles/owner"`);
            console.log(chalk.green('Successfully associated service ' +
                'account with project.'));
        } catch(e) {
            console.error(chalk
                .red('Error occurred associating service account with project.'), e);
        }
    }

    /**
     * Creates the service account.
     */
    createServiceAccountKey(project, username) {
        try {
            const filename = `"${__dirname}/keys/${project}.json"`;
            require('child_process')
                .execSync(`gcloud iam service-accounts keys create ` +
                `${filename} --iam-account ` + 
                `${username}@${project}.iam.gserviceaccount.com`);
            console.log(chalk.green(`Successfully created key file located at ${filename}.`));
        } catch(e) {console.error(chalk.red('Error occurred creating key file.'), e);}
    }

    /**
     * Sets up the Google IAM account.  If successful, stores the credentials
     * in memory for subsequent requests.
     * @param {String} project The project to setup.
     * @param {String} username The username to create a service account with 
     * and associate with the project.
     */
    setup(project, username) {
        try {
            require('child_process').execSync('gcloud auth login');
            console.log(chalk.green('Successfully authenticated.'));
        } catch(e) {
            console.log(chalk.red('Error occurred with auth.', e));
        }

        project = this.configs['google'].project;
        username = this.configs['google'].username;

        Google.setProject(project);
        this.setupServiceAccount(username);
        this.associateServiceAccountWithProject(project, username);
        this.createServiceAccountKey(project, username);
    }
    /**
     * Sets up the service account using the user's authentication credentials
     * stored in-memory.
     * @todo Don't execute command if user already exists, derp derp.
     * @param {String} username The username to create.
     */
    setupServiceAccount(username) {
        try {
            require('child_process')
                .execSync(`gcloud iam service-accounts create ${username}`);
            console.log(chalk.green(`Successfully created service account as ${username}.`));
        } catch(e) {console.error(chalk.red('Error occurred with creating service account.', e));}
    }
}

module.exports = GoogleIAM;