const chalk = require('chalk');
// TODO: This should be done via the dependencies/package.json.
const Docker = new require(__dirname + '/../docker/index.js');
/**
 * @class Interfaces with GCP.
 */
class GoogleContainerRegistry {
    constructor() {
        this.configs = {
            docker: JSON.parse(require('fs').readFileSync(__dirname + 
                '/../docker/configs/docker.json', 'utf8')),
            google: JSON.parse(require('fs').readFileSync(__dirname + 
                '/configs/google.json', 'utf8'))
        };
    }

    /**
     * Ships the Docker container.
     * @param {String} project The project to associate with the image.
     * @param {String} imageName The name of the image.
     * @param {String} stage The stage to push to.
     */
    ship(project, imageName, stage) {
        project = this.configs['google'].project;
        imageName = this.configs['docker'].imageName;
        stage = this.configs['google'].stage;
        const hyphen = stage.length > 0 ? '-' : '';
        const link = `gcr.io/${project}/${imageName + hyphen + stage}`;
        Docker.machine.getEnv();
        Docker.image.tag(imageName, link);
        this.shipContainer(link);
    }

    /**
     * Ships the built Docker container.
     * @param {String} where The URL where the container pushes to.
     */
    shipContainer(where) {
        try {
            require('child_process')
                .execSync(`gcloud docker -- push ${where}`, {
                    env: process.env,
                    stdio: 'inherit'
                });
            console.log(chalk.green('Success in deploying Docker image.'));
            console.log(chalk.cyan('Docker image should be available via: '), where);
        } catch(e) {
            console.log(chalk.red('Error in deploying Docker image.'), e);
        }
    }
}

module.exports = GoogleContainerRegistry;