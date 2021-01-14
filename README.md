# Weirdos Salesforce App

## Local Dev Setup

1. Install sfdx CLI using the [installer](https://developer.salesforce.com/tools/sfdxcli) or `npm install --global sfdx-cli`
1. `git clone` this repo and `cd` into its directory
1. `sfdx force:auth:web:login --setalias=WeirdosDevHub --setdefaultdevhubusername` to authenticate with a Dev Hub Salesforce org I've already created. It will open a browser window asking you to login. You should have received an email with credentials for this.
1. `sfdx force:org:create -f config/project-scratch-def.json --setalias weirdosscratch --durationdays 30 --setdefaultusername` to create an empty scratch org. This will be your "local" (and easily disposable) dev environment.
1. `sfdx force:source:push` to deploy the code in this directory to the scratch org you just created.
1. `sfdx force:user:password:generate` to generate a password to use with jsforce as described below. Use the username and password it outputs with the code below.

## Use Local Dev Setup

Now you can use the [jsforce](https://jsforce.github.io) library to do CRUD operations (among other things) against the sample data. You'll need to do something like ths to get a `conn` object which you can then use to make [CRUD](https://jsforce.github.io/document/#crud) or [SOQL Query](https://jsforce.github.io/document/#query) requests.

```javascript
var jsforce = require("jsforce");
var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl: "https://test.salesforce.com"
});
conn.login(username, password, function (err, userInfo) {
  if (err) {
    return console.error(err);
  }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ...
});
```

Now use the instructions to make [CRUD](https://jsforce.github.io/document/#crud) or [SOQL Query](https://jsforce.github.io/document/#query) requests.

## Example SOQL Queries

### Get all Card data

```sql
SELECT Id, Name, Email__c, Bio__c, Picture_Content_Version_ID__c, Feats_of_Strength__c, Main_Website__c, Twitter_Username__c, Instagram_Username__c, GitHub_Username__c, LinkedIn_Username__c, CodePen_Username__c
FROM Card__c
LIMIT 1
```

### Get picture for a Card

```javascript
// Get metadata for image, such as FileType which the <img> tag needs to display the image
conn.request("/services/data/v50.0/sobjects/ContentVersion/0698A00000131ZvQAI");

// Get bytes for image
conn.request(
  "/services/data/v50.0/sobjects/ContentVersion/0698A00000131ZvQAI/VersionData"
);
```

`0698A00000131ZvQAI` is the Picture Content Version ID returned by the previous query. This returns bytes for the image which can then be shown on a webpage with `<img src="data:image/jpeg,deadbeef">`. `deadbeef` is the bytes for the image returned above.

**Note**: The image file type--e.g. `jpeg` in the img tag above--will need to be replaced with the correct file type.

**Note2**: It wasn't clear to me if the image bytes returned from Salesforce are base64 encoded or not. If they are, the img tag will need to be `<img src="data:image/jpeg;base64,deadbeef">`.

### Get all Websites

```sql
SELECT Id, Name, URL__c
FROM Website__c
```

### Get all Stickers for a Card

```sql
SELECT Id, Name, Image_Alt_Text__c
FROM Sticker__c
WHERE Id IN
  (SELECT Sticker__c
   FROM Card_Sticker_Association__c
   WHERE Card__c = '0038A00000XQ2s4QAD')
```

`0038A00000XQ2s4QAD` is the Card ID returned by the first query.

### Get a Webring

```sql
SELECT Id, Name, Description__c
FROM Webring__c
LIMIT 1
```

### Get all Websites for a Webring

```sql
SELECT Id, Name, URL__c
FROM Website__c
WHERE Id IN
  (SELECT Website__c
   FROM Website_Webring_Association__c
   WHERE Webring__c = 'a048A000002yeJDQAY')
```

`a048A000002yeJDQAY` is Webring ID returned by the previous query

## TODO

- [x] Create app in Salesforce app launcher Determine user flow for deploying Heroku app + Salesforce app and then trading card setup experience. https://github.com/crcastle/weirdos-salesforce-app/issues/6
- [ ] Determine user flow for deploying Heroku app + Salesforce app and then trading card setup experience.
- [ ] Configure Salesforce UI for Weirdos-specific use cases e.g.
  - [x] filling out trading card contact info
  - [ ] adding stickers to trading card
  - [ ] creating a webring
  - [ ] adding websites to a webring.
- [x] Feats of Strength https://github.com/crcastle/weirdos-salesforce-app/issues/7
  - What is difference between Feats of Strength and Stickers
  - Possible to use dynamic multi picklist instead of text field?
- [x] Figure out how to export sample data as a plan so that it can be imported
- [x] Add ability to upload image to Contact (for trading card) https://github.com/crcastle/weirdos-salesforce-app/issues/5
- [ ] Create the Salesforce Sticker Webring manager main application
- [ ] Update Import Data Instructions

## General Information About Salesforce DX Projects

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
