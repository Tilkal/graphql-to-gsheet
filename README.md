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
You don't need any experience with command line commands and you can follow the instructions given here without the use of the command line. If you are a developer or have some more experience with the CLI, git etc., there is an installation process that works slightly more smoothly using those tools (see below). 


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



  
