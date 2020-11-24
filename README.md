# graphql-to-gsheet
GraphQL requests beautifully presented in a Google Sheet

# Introduction 
This repository serves Google Apps Script (GAS) files that can be used within your own Google sheet editor to call upon Tilkal's GraphQL API and display data within your own Google sheet.

Table of contents
=================

<!--ts-->
   * [Introduction](#introduction)
   * [Table of contents](#table-of-contents)
   * [How it works](#how-it-works)
   * [Installation](#installation)
      * [Using the console](##using_the_console)
      * [Using the Command Line Interface and clasp](##using-the-cli)
<!--te-->

# Prerequisites

# How it Works (for beginners)

Any google sheet can be used as a 'blank slate' to display data that is obtained from a GraphQL API. The way it works, or its brain is a normally hidden script editor which can store and run code. Let's try something very simple to make things clear. Ideas for this 'How it works' is due to [Ben Collin's blog](https://www.benlcollins.com/apps-script/google-apps-script-beginner-guide/).

1. Open a blank google sheet in your google drive
2. On the menu bar, navigate to `Tools` and then  `<>Script Editor` and click on it
3. You'll see an almost empty code editor like below. Code.gs is a Google Apps Script file. myFunction() is a function, which is now empty. Let's fill it in next.
  ![Empty_code_editor](/Images/gaseditor.png)
4. Write down the following code inside the myFunction function
  ![Hello-world_function](/Images/helloworld.png)
5. Now we need to save this function. If you try, you will likely be asked permissions like so. Grant it the required permissions.
  ![Seeking-permission](/Images/requirespermission.png)
6. Finally, we can run our function. Click on the run button (a black triangle under the publish button). When you click on this and go back to your google sheet, you should see the following Hello World popup like so. Et Voila! You've made your first GAS project! :) 
  ![HelloWorldpopup](/Images/hellowordbox.png)
  
  
 # Installation
 
 Here we will see how we can use the .gs files, upload them to our Google Sheets Project and get it going. 
 
 There are two ways of getting this google sheets project going -
 <!--ts-->
   * [Using the Console](#using-the-console)
   * [Using the Command Line Interface and clasp](#using-the-cli)
<!--te-->

## Using the Console

The *easiest* way, especially for non developers to get this up and running is to copy and paste the code from the .gs files here into the script editor of Google Sheets. If you have some experience with this, it should be fairly straightforward. 

1. Download the file TilkalGQL2Sheets.xlsx. Upload it to your Google Drive and open it as a Google Sheet. 

2. On the menu bar, navigate to `Tools` and then  `<>Script Editor` and click on it

3. You'll see an almost empty code editor like below. Code.gs is a Google Apps Script file. myFunction() is a function, which is now empty.

![Empty_code_editor](/Images/gaseditor.png)

4. Delete everything from the code.gs file. From this repository, open the file onopen.gs and copy-paste the contents of it into code.gs. Now rename code.gs as      onopen.gs and save the file. 

![Onopen](/Images/onopen.png)
  
5. We can do the same with the other files in the repository. Let us say you want to copy searchbybatch.gs. Go to File > New > Script file and enter the name 'searchbybatch'. This opens up another script file with an empty function. As before, delete this and copy-paste the contents of searchbybatch.gs file from the repo to the empty script file in your browser. 

6. Once you have all the files in place, you are good to go. Save everything (If you see a small red star next to a filename in the script editor, it means that the file isn't saved). So make sure you save all files. 

7. Refresh the Google Sheet and now you should have a pop up boxes that open up that ask for your credentials. Enter them. 

8. Now, you should see a a 'Custom Tilkal Menu' on the menu bar. Click on it to see the various views available to see your data. 

![Custommenu](/Images/custommenu.png)
