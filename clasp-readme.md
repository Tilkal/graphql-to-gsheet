# Context

Google sheets are enabled with a script editor in Tools > Script Editor. We can write, run and manage code here using Google Apps Script (GAS), which is based on an old version of Javascript.

# Using Clasp ([Github](https://github.com/google/clasp))

Working inside the code editor can become difficult. It is possible to work on projects locally, using an IDE. The open source tool to do this is called clasp.
[Here](https://developers.google.com/apps-script/guides/clasp) is the documentation source. 

**Installation**

Once you've installed Node.js, you can use the following npm command to install clasp:

```npm install @google/clasp -g```

After installing, the clasp command is available usable from any directory on your computer.

**Using clasp**

You can use clasp to handle a variety of tasks from the command line. This section describes common operations you can use when developing with clasp.

**Login**

This command logs in and authorizes management of your Google account's Apps Script projects. Once it is run, you are asked to sign into a Google account where your Apps Script projects are stored.

```clasp login```

**Logout**

This command logs out of the command line tool. You must re-login using clasp login to re-authenticate with Google before continuing to use clasp.

```clasp logout```

**Create a new apps script project**

This command creates a new script in the current directory with an optional script title.

```clasp create [scriptTitle]```

This command also creates two files in the current directory:

1. A .clasp.json file storing the script ID.
2. An appsscript.json project manifest file containing project metadata.

**Clone an existing project**

This command clones an existing project in the current directory. The script must be created or shared with your Google account. You specify the script project to clone by providing it's script ID. You can find the script ID of a project by opening the project in the Apps Script editor and selecting File > Project properties > Info.

```clasp clone <scriptId>```

**Download a script project**

This command downloads the Apps Script project from Google Drive to your computer's file system.

```clasp pull```

**Upload a script project**

This command uploads all of a script project's files from your computer to Google Drive.

```clasp push```

**List project versions**

This command lists the number and description of each of a script project's versions.

```clasp versions```

**Deploy a published project**

You can deploy script projects as web apps, add-ons, or executables. You can create deployments in the script editor, in the project manifest, or using clasp.

To deploy a project with clasp, first create an immutable version of the Apps Script project. A version is a "snapshot" of a script project and is similar to a read-only branched release.

```clasp version [description]```

This command displays the newly created version number. Using that number, you can deploy and undeploy instances of your project:

```clasp deploy [version] [description]```
```clasp undeploy <deploymentId>```

This command updates an existing deployment with a new version and description:

```clasp redeploy <deploymentId> <version> <description>```

**List deployments**

This command lists the script project's deployment IDs, versions, and their descriptions.

```clasp deployments```

**Open the project in the Apps Script editor**

This command opens a script project in the Apps Script editor. The editor is launched as a new tab in your default web browser.

```clasp open```

# Using TypeScript

It's possible to use TS to write and edit code. [Here](https://developers.google.com/apps-script/guides/typescript) are more details.

Note: Existing .gs/.js files can be upgraded to .ts files by renaming the file extension. TypeScript and ES6 features can be added incrementally to existing files.
