# Avatar resizer

Infrastructure project for HETIC.

## Description

### Local infrastructure schema
![local-infra](./docs/local-infra.jpg)

### Cloud infrastructure schema
![cloud-infra](./docs/cloud-infra.jpg)

## Conventions

### Commit convention

A commit convention based on Angular commit message guideline. You can find it [here](https://gist.github.com/brianclements/841ea7bffdb01346392c)

To make it quick every commit should look like this :

`<type>(<scope>): <subject>`

A git hook is defined in the .githooks directory to respect a certain commit pattern.

Type should be either feat|fix|doc|add|update|delete.

The developer is free to chose scope and subject.

### Branching convention

We will be using [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) branching workflow.

A git hook is also defined in the .githooks directory to respect a certain branch naming pattern.

You should call your branch feature|bugfix|improvement|release|hotfix|support/branch-subject

## Usage

### Prerequisites

* make 
* docker 
* docker-compose 

If you are cloning project for the first time, run

`make init`

To start working on project run

`make dev`

The app might crash the first time you run it. Simply kill the server using Ctrl-C, and restart it.