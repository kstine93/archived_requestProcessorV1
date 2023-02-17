# Introduction
This file documents what Kevin has learned from his work in creating the 'data-deletion-service' application with Jan Brockmeyer, starting in March 2022. Namely, this focuses on the creation and customization of a CDP pipeline and the development of Typescript-based code to achieve the goals of the data deletion service: [link to design document](https://docs.google.com/document/d/1iLrPFGJdlAsoBn5KiBffxRESV8DA4WvPY0B4zRxEGtg/edit#).

# File Overview
## delivery.yaml
delivery.yaml defines how Zalando's CDP service will interpret the GitHub repository when certain actions are performed upon it (i.e., Pull request, push, merge). These actions signal to the CDP service that the delivery.yaml file should be ingested and (most likely) an application should be built on one of Zalando's cloud computing systems (e.g., Kubernetes).
The delivery.yaml file can be [configured in many ways](https://sunrise.zalando.net/docs/default/Component/cloud/reference/delivery.yaml/), allowing the engineer to do a few things:
* Run commands on the virtual machine on which the application is built (e.g., re-organizing file structure, compiling certain code)
* Define where exactly the application should be built (e.g., Kubernetes cluster with X resources)
* Define tests or other commands which should be performed on the application once it is built
* Define how much traffic your new application should receive relative to the old version

## deploy/pr/apply/stackset.yaml

## .zappr.yaml
[Zappr](https://zappr.opensource.zalan.do/login) is a tool to customize how pull requests are merged- most importantly by enforcing the testing of new code and requiring that more than 1 person approve the merger. This small file simply tells Zappr the name of the team who developed the code and the type of code it is (e.g., "Tool").

## package.json
The package.json file is an artefact of the node.js 'node package manager' (npm). Npm acts like an environment manager for a code base - it manages the installation of javascript packages, and also can run testing scenarios for you on your code (that you define). It lists dependencies that your code requires and also has space to write out authors, a description of your code, etc. If you were to take your code base and turn it into a package itself, this file would help npm and other users understand your code and interact with it. Read more on the [node.js website](https://nodejs.dev/learn/the-package-json-guide)

## package-lock.json
This file's purpose is to *set in stone* the versions of the packages that your code uses. It's possible in the package.json file to specify relative versions of packages (which allows more recent versions of packages to be used once they are released). However, this can be undesired behavior. The package-lock.json. [Read more here](https://nodejs.dev/learn/the-package-lock-json-file)

## tsconfig.json
The code in the data-deletion-service application is written in Typescript - not Javascript. Typescript is great for development, but needs to be complied into Javascript before it can be run (running Typescript natively is not done much yet). This file tells npm how to compile our typescript. We can additionally specify where to store the compiled files among a variety of other configuration options [specified here](https://www.typescriptlang.org/tsconfig#Project_Files_0)

## .gitignore
This is simply a list of files which Git should ignore when pushing code to the Git server.