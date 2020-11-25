# graphql-to-gsheet
GraphQL requests beautifully presented in a Google Sheet

# Introduction 
This repository serves Google Apps Script (GAS) files that can be used within your own Google sheet editor to call upon Tilkal's GraphQL API and display data within your own Google sheet.

Table of contents
=================

<!--ts-->
   * [Introduction](#introduction)
   * [Table of contents](#table-of-contents)
   * [Prerequisites](#prerequisites)
   * [Installation](#installation)
      * [Using the console](#using-the-console)
      * [Using the Command Line Interface and clasp](#using-the-CLI-and-CLASP)
<!--te-->

# Prerequisites

You need to have access to a google account. Specifically, you need to be able to create and edit google sheets, located within google drive. 
You don't need any experience with command line commands and you can follow the instructions given here without the use of the command line. 

If you are a developer or have some more experience with the CLI, git etc., there is an installation process that works slightly more smoothly using those tools (see below). In that case, you will need Node.js on your local machine.


 # Installation
 
 Here we will see how we can use the .gs files, upload them to our Google Sheets Project and get it going. 
 
 There are two ways of getting this google sheets project going -
 <!--ts-->
   * [Using the Console](#using-the-console)
   * [Using the Command Line Interface and clasp](#using-the-cli)
<!--te-->

## Using the Console

The *easiest* way, especially for non developers, to get this up and running is to copy and paste the code from the .gs files here into the script editor of Google Sheets. If you have some experience with this, it should be fairly straightforward. 

1. Download the file TilkalGQL2Sheets.xlsx. Upload it to your Google Drive and open it as a Google Sheet. 

2. On the menu bar, navigate to `Tools` and then  `<>Script Editor` and click on it.

3. A new window will open up where you'll see an almost empty code editor like below. Code.gs is a Google Apps Script file. myFunction() is a function, which is now empty.

![Empty_code_editor](/Images/gaseditor.png)

4. Delete everything from the code.gs file. From this repository, open the file onopen.gs and copy-paste the contents of it into code.gs. Now rename code.gs as      onopen.gs and save the file. 

![Onopen](/Images/onopen.png)
  
5. We can do the same with the other files in the repository. Let us say you want to copy searchbybatch.gs. Go to File > New > Script file and enter the name 'searchbybatch'. This opens up another script file with an empty function. As before, delete this and copy-paste the contents of searchbybatch.gs file from the repo to the empty script file in your browser. 

6. Once you have all the files in place, you are good to go. Save everything (If you see a small red star next to a filename in the script editor, it means that the file isn't saved). So make sure you save all files. 

7. Refresh the Google Sheet and now you should have a pop up boxes open up that ask for your credentials. Enter your credentials. 

8. Now, you should see a a 'Custom Tilkal Menu' on the menu bar. Click on it to see the various views available to see your data. 

![Custommenu](/Images/custommenu.png)

**That's it. You're all set up. Now you can access your data from Google sheets and use its BI tools like making graphs, charts and maps. If you would like to make your own functions to access even more views using google sheets and graphql, check out the How it works series of files.**

## Using the CLI and CLASP

This installation guide is for developers or those with some more experience with the command line to make code editing a more smooth experience. We will use git to clone this repository. We will also use an open source tool called CLASP (Command Line Apps Script Project). Using CLASP allows us to use an IDE like VSCODE to edit our code (instead of the in-browser GAS editor). [Here](https://developers.google.com/apps-script/guides/clasp) is the documentation source. 

**1. Installation**

Once you've installed Node.js, you can use the following npm command to install clasp:

```npm install @google/clasp -g```

After installing, the clasp command is available usable from any directory on your computer.

**2. Login**

This command logs in and authorizes management of your Google account's Apps Script projects. Once it is run, you are asked to sign into a Google account where your Apps Script projects are stored.

```clasp login```

**3. Create a folder of your local machine called GASproject (or another name of your liking)**

**3. Clone a GAS project**
     - Download the file TilkalGQL2Sheets.xlsx. Upload it to your Google Drive and open it as a Google Sheet. 
     - On your local machine navigate to your GASProject folder and Clone the Google sheet project you created using 
    
    ```clasp clone <scriptId>```

You specify the script project to clone by providing it's script ID. You can find the script ID of a project by opening the project in the Apps Script editor and selecting File > Project properties > Info.

**4. Observe on VSCode**

If you are using VSCode or any IDE, you should now see a file code.js file (Notice that the .gs file inside the Apps Script editor becomes .js on your local machine. Don't worry, once you push it back, clasp will automatically change it to .gs again)

**4. Clone this repo**

Now, we want to make GASProject our working directory. So, we could clone our project here or clone somewhere and move the required files to the GASProject. I would recommend cloning this repository in a different location, because we don't really need all the files (readme, images etc) in our Apps Script Project. 

```git clone https://github.com/rrupam/graphql-to-gsheet.git``` 

and move all the .gs files into the GASProject.

**5. Upload these files into the Apps Script Editor**

 This command uploads all of a script project's files from your computer to Google Drive.

```clasp push```

**That's it. Once you've saved everything on the Apps Script Editor. Your Google Sheet Project should be running. Refresh and enter your credentials. And view your data.**

NB: The advantage of using the CLI and clasp is that you can edit your code in your favourite IDE locally and with a simple ```clasp psuh``` and ```clasp pull``` you can navigate back and forth between the online editor and your local IDE. If you would like to use this method of managing your apps script project, we would highly recommend checking out clasp. For starters, please read the clasp readme here.


**Logout**

This command logs out of the command line tool. You must re-login using clasp login to re-authenticate with Google before continuing to use clasp.

```clasp logout```

1. 

2. On the menu bar, navigate to `Tools` and then  `<>Script Editor` and click on it.

3. 



  
