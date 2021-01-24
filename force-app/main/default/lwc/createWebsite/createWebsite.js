import { LightningElement, wire, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { publish, MessageContext } from "lightning/messageService";

import WEBSITE_OBJECT from "@salesforce/schema/Website__c";
import NAME_FIELD from "@salesforce/schema/Website__c.Name";
import URL_FIELD from "@salesforce/schema/Website__c.URL__c";
import WEBRING_FIELD from "@salesforce/schema/Website__c.Webring__c";
import WEBSITE_ADDED from "@salesforce/messageChannel/Website_Added__c";

/**
 * Creates Website records.
 */
export default class CreateWebsite extends LightningElement {
  @api webringId;
  websiteObject = WEBSITE_OBJECT;
  fields = [NAME_FIELD, URL_FIELD, WEBRING_FIELD];
  subscription;

  @wire(MessageContext)
  messageContext;

  handleSuccess() {
    // Show notification
    const toastEvt = new ShowToastEvent({
      title: "Website created",
      message: "Your website has been created and added to webring",
      variant: "success"
    });
    this.dispatchEvent(toastEvt);

    // Publish message so list of websites can update
    publish(this.messageContext, WEBSITE_ADDED);

    // Reset fields
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    if (inputFields) {
      inputFields.forEach((field) => {
        if (!field.disabled) {
          field.reset();
        }
      });
    }
  }
}
