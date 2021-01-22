import { LightningElement, wire } from "lwc";
import { getFieldValue } from "lightning/uiRecordApi";

import getWebring from "@salesforce/apex/WebringController.getWebring";
import WEBRING_ID_FIELD from "@salesforce/schema/Webring__c.Id";

export default class WebringHome extends LightningElement {
  webringId;

  @wire(getWebring, {})
  webring({ error, data }) {
    if (data) {
      this.webringId = data[0].Id;
    } else if (error) {
      console.log("Error getting Webring ID:", error);
    }
  }
}
