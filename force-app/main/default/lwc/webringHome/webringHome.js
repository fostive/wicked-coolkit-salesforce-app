import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

import getWebrings from "@salesforce/apex/WebringController.getWebrings";
import WEBRING_OBJECT from "@salesforce/schema/Webring__c";
import WEBRING_NAME_FIELD from "@salesforce/schema/Webring__c.Name";
import WEBRING_DESCRIPTION_FIELD from "@salesforce/schema/Webring__c.Description__c";

export default class WebringHome extends LightningElement {
  webringId;
  webringList;
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

      this.webringList = data.map((webring) => ({
        value: webring.Id,
        label: webring.Name
      }));
    }
  }

  handleWebringChange(event) {
    this.webringId = event.detail.value;
  }

  handleCreateSuccess() {
    const toastEvt = new ShowToastEvent({
      title: "Webring created",
      message: "Your webring has been created",
      variant: "success"
    });
    this.dispatchEvent(toastEvt);

    refreshApex(this.webringsResponse);
  }

  get zeroWebrings() {
    return this.webringId === undefined;
  }

  get oneWebring() {
    return typeof this.webringId === "string";
  }
}
