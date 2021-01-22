import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import WEBSITE_OBJECT from "@salesforce/schema/Website__c";
import NAME_FIELD from "@salesforce/schema/Website__c.Name";
import URL_FIELD from "@salesforce/schema/Website__c.URL__c";
import WEBRING_FIELD from "@salesforce/schema/Website__c.Webring__c";

/**
 * Creates Website records.
 */
export default class CreateWebsite extends LightningElement {
  websiteObject = WEBSITE_OBJECT;
  fields = [NAME_FIELD, URL_FIELD, WEBRING_FIELD];
  mode = "edit";

  handleSuccess() {
    const toastEvt = new ShowToastEvent({
      title: "Website created",
      message: "Your website has been created and added to webring",
      variant: "success"
    });
    this.dispatchEvent(toastEvt);
  }
}
