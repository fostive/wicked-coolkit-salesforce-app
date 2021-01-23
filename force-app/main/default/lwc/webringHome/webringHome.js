import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import getWebring from "@salesforce/apex/WebringController.getWebring";
import WEBRING_OBJECT from "@salesforce/schema/Webring__c";
import WEBRING_NAME_FIELD from "@salesforce/schema/Webring__c.Name";
import WEBRING_DESCRIPTION_FIELD from "@salesforce/schema/Webring__c.Description__c";

export default class WebringHome extends LightningElement {
  webringId;
  webringObject = WEBRING_OBJECT;
  webringFields = [WEBRING_NAME_FIELD, WEBRING_DESCRIPTION_FIELD];
  mode = "edit";

  @wire(getWebring, {})
  webring({ error, data }) {
    if (error) {
      console.log("Error querying Webring(s):", error);
    } else if (data && data[0]) {
      this.webringId = data[0].Id;
    }
  }

  handleCreateSuccess() {
    const toastEvt = new ShowToastEvent({
      title: "Webring created",
      message: "Your webring has been created",
      variant: "success"
    });
    this.dispatchEvent(toastEvt);

    // TODO: refresh UI so that it shows empty list of websites in webring
  }

  get zeroWebrings() {
    return this.webringId === undefined;
  }

  get oneWebring() {
    return typeof this.webringId === "string";
  }

  get multipleWebrings() {
    return Array.isArray(this.webringId);
  }
}
