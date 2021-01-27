import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import userId from "@salesforce/user/Id";
import { refreshApex } from "@salesforce/apex";

import getWebrings from "@salesforce/apex/WebringController.getWebrings";
import WEBRING_OBJECT from "@salesforce/schema/Webring__c";
import WEBRING_NAME_FIELD from "@salesforce/schema/Webring__c.Name";
import WEBRING_DESCRIPTION_FIELD from "@salesforce/schema/Webring__c.Description__c";

// not importing this from @salesforce/schema so that this code
// can be deployed if that field does not exist in the org
const HEROKU_APP_NAME_FIELD = "User.HerokuAppName__c";

export default class WebringHome extends LightningElement {
  loading = true;
  webringId;
  webringObject = WEBRING_OBJECT;
  webringFields = [WEBRING_NAME_FIELD, WEBRING_DESCRIPTION_FIELD];
  mode = "edit";
  webringsResponse;

  @wire(getWebrings)
  webrings(response) {
    this.webringsResponse = response;

    const { data, error } = response;
    if (error) {
      console.log("Error getting list of Webring(s):", error);
    } else if (data && data[0]) {
      this.webringId = data[0].Id;
    }
  }

  @wire(getRecord, {
    recordId: userId,
    fields: [HEROKU_APP_NAME_FIELD]
  })
  herokuAppNameResponse;

  get embedCode() {
    if (this.herokuAppNameResponse.error) {
      return (
        "Error generating embed code. Have you authenticated your" +
        " Heroku trading card app with this Salesforce app?"
      );
    }

    const herokuAppName = getFieldValue(
      this.herokuAppNameResponse.data,
      HEROKU_APP_NAME_FIELD
    );

    return `<script type="module" async src="https://unpkg.com/wicked-coolkit/dist/webring.js"></script>
<wck-webring host="${herokuAppName}"></wck-webring>`;
  }

  handleCreateSuccess() {
    this.dispatchEvent(
      new ShowToastEvent({
        title: "Webring created",
        variant: "success"
      })
    );

    refreshApex(this.webringsResponse);
  }

  connectedCallback() {
    this.loading = false;
  }

  get zeroWebrings() {
    return this.webringId === undefined;
  }

  get oneWebring() {
    return typeof this.webringId === "string";
  }
}
