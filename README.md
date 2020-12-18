# Graphql-to-Gsheet: In a nutshell
GraphQL requests beautifully presented in a Google Sheet

# Introduction 
This repository serves Google Apps Script (GAS) files that can be used within your own Google sheet editor to call upon Tilkal's GraphQL API and display data within your Google sheet.

[According to Google](https://developers.google.com/apps-script/overview), Google Apps Script is a rapid application development platform that makes it fast and easy to create business applications that integrate with Google Workspace. You write code in modern JavaScript and have access to built-in libraries for favorite Google Workspace applications like Gmail, Calendar, Drive, and more. There's nothing to install—we give you a code editor right in your browser, and your scripts run on Google's servers. 

Table of contents
=================

<!--ts-->
   * [Introduction](#introduction)
   * [Table of contents](#table-of-contents)
   * [Prerequisites](#prerequisites)
   * [Installation](#installation)
      * [Using the console](#using-the-console)
      * [**(optional)** Using the Command Line Interface and clasp](#using-the-CLI-and-CLASP) 
<!--te-->

# Prerequisites

You need to have access to a google account. Specifically, you need to be able to create and edit google sheets, located within google drive. 
You don't need any experience with command line commands and you can follow the instructions given here without the use of the command line. 

If you are a developer or have some more experience with the CLI, git etc., there is an installation process that works slightly more smoothly using those tools (see below). Please check out the prerequisites for that approach in the [Using the Command Line Interface and CLASP](#using-the-CLI-and-CLASP) section

 # Installation
 
 Here we will see how we can use the .gs files, upload them to our Google Sheets Project and get it going. 
 
 There are two ways of getting this google sheets project going -
 <!--ts-->
   * [Using the Console](#using-the-console)
   * [Using the Command Line Interface and clasp](#using-the-cli)
<!--te-->

## Using the Console

The *easiest* way to get this up and running is to copy and paste the code from the .gs files here into the script editor of Google Sheets. If you have some experience with this, it should be fairly straightforward. 

**1. Upload the TilkalGQLSheets file in Google drive**

Download the file TilkalGQL2Sheets.xlsx. Upload it to your Google Drive and open it as a Google Sheet. 

**Save the file as a GoogleSheet. Go to File > Save as GoogleSheet**

**2. Open the Apps Script Editor or GAS editor**

On the menu bar, navigate to `Tools` and then  `<>Script Editor` and click on it.

**3. Check out the code.gs file** 

A new window will open up where you'll see an almost empty code editor like below. Code.gs is a Google Apps Script file. myFunction() is a function, which is now empty.


![Empty_code_editor](/Images/gaseditor.png)

**4. Write your own code in the file**

Delete the empty myFunction() from the code.gs file. On this blank sheet, we will write the code from this repository. First, change the name of code.gs to **onopen.gs** by clicking on the down arrow next to the file name. On this repository, open the Apps Script files folder and open **onopen.gs** and copy-paste the contents of it into **onopen.gs**. **SAVE THE FILE.** (ctrl + s) 
![Onopen](/Images/onopen.png)
  
**5. Upload other files into the editor (if there are any)**

We can do the same with the other files in the repository. Let us say you want to copy a file called file.gs. On your Apps script Edito, go to File > New > Script file and enter the name 'file'. This opens up another script file with an empty function. As before, delete this and copy-paste the contents of file.gs file from the repo to the empty script file in your browser. 

**6. Save**

Once you have all the files in place, you are good to go. Save everything (If you see a small red star next to a filename in the script editor, it means that the file isn't saved). So make sure you save all files. 

**7. Execute** 

Refresh the Google Sheet. Now, you should see a a **'Custom Tilkal Menu'** on the menu bar. Click on it to see the various views available to see your data. Click on one of the options. 
![Custommenu](/Images/custommenu.png)

You will be asked to authorize google apps script to let you execute code. Give it the necessary permissions. Once you do, you may have to click on the **Custom Tilkal Menu** on the menu bar again. Make your choice one more time. This time, a new pop up box should open up asking you to enter a credential like 'Client name'. 

![Credentials](/Images/credentials.png)


Once you enter this, another box will pop up asking for network name. Once all the credentials have been provided, your script will run and you should see the result on the relevant page. 





**That's it. You're all set up. Now you can access your data from Google sheets and use its BI tools like making graphs, charts and maps. If you would like to make your own functions to access even more views using google sheets and graphql, check out the How it works series of files.**

## Using the CLI and CLASP

This installation guide is for developers or those with some more experience with the command line to make code editing a more smooth experience. We will use git to clone this repository. We will also use an open source tool called CLASP (Command Line Apps Script Project). Using CLASP allows us to use an IDE like VSCODE to edit the code (instead of the in-browser GAS editor). [Here](https://developers.google.com/apps-script/guides/clasp) is the documentation source. 

### Prerequisites
You will need [Node.js](https://nodejs.org/en/download/) installed.  

**1. Installation**

Once you've installed Node.js, you can use the following npm command to install clasp:

```npm install @google/clasp -g```

After installing, the clasp command is available usable from any directory on your computer.

**2. Login**

This command logs in and authorizes management of your Google account's Apps Script projects. Once it is run, you are asked to sign into a Google account where your Apps Script projects are stored.

```clasp login```

**3. Create a folder of your local machine called GASproject (or another name of your liking)**

**4. Clone a GAS project**

   - Download the file TilkalGQL2Sheets.xlsx. Upload it to your Google Drive and open it as a Google Sheet.
   - Save the file as a GoogleSheet. Go to File > Save as GoogleSheet.
   - On your local machine navigate to your GASProject folder and Clone the Google sheet project you created using
    
```clasp clone <scriptId>```

You specify the script project to clone by providing it's script ID. You can find the script ID of a project by opening the project in the Apps Script editor and selecting File > Project properties > Info.

**5. Open on VSCode (or any IDE)**

If you are using VSCode or any IDE, you should now see a file code.js file (Notice that the .gs file inside the Apps Script editor becomes .js on your local machine. Don't worry, once you push it back, clasp will automatically change it to .gs again)

**6. Clone this repo**

Now, we want to make GASProject our working directory. So, we could clone our project here or clone somewhere and move the required files to the GASProject. I would recommend cloning this repository in a different location, because we don't really need all the files (readme, images etc) in our Apps Script Project. 

```git clone https://github.com/rrupam/graphql-to-gsheet.git``` 

and move all the .gs files into the GASProject.

#### NOTE: You should rename the extension of your files from .gs to .js to fully use the functionalities of the IDE.

**7. Upload these files into the Apps Script Editor**

 This command uploads all of a script project's files from your computer to Google Drive.

```clasp push```

**8. Logout**

This command logs out of the command line tool. You must re-login using clasp login to re-authenticate with Google before continuing to use clasp.

```clasp logout```

**That's it. Once you've saved everything on the Apps Script Editor. Your Google Sheet Project should be running. Refresh and enter your credentials. And view your data.**

NB: The advantage of using the CLI and clasp is that you can edit your code in your favourite IDE locally and with a simple ```clasp psuh``` and ```clasp pull``` you can navigate back and forth between the online editor and your local IDE. If you would like to use this method of managing your apps script project, we would highly recommend checking out clasp. For starters, please read the clasp readme file in the repo.
