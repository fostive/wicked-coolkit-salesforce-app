import { LightningElement, wire, api } from "lwc";
import getWebsitesByWebring from "@salesforce/apex/WebsiteController.getWebsitesByWebring";
import {
  updateRecord,
  deleteRecord,
  getRecord,
  getFieldValue
} from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";

import WEBRING_NAME from "@salesforce/schema/Webring__c.Name";
import WEBSITE_ID_FIELD from "@salesforce/schema/Website__c.Id";
import WEBSITE_URL_FIELD from "@salesforce/schema/Website__c.URL__c";
import WEBSITE_NAME_FIELD from "@salesforce/schema/Website__c.Name";
import WEBSITE_ADDED from "@salesforce/messageChannel/Website_Added__c";

const actions = [{ label: "Delete", name: "delete" }];

const columns = [
  { label: "URL", fieldName: "URL__c", editable: true, type: "url" },
  { label: "Name", fieldName: "Name", editable: true },
  { type: "action", typeAttributes: { rowActions: actions } }
];

export default class WebringList extends LightningElement {
  @api webringId;
  columns = columns;
  websiteList;
  subscription;
  websitesByWebringResponse;
  draftValues = [];

  @wire(getWebsitesByWebring, { webringId: "$webringId" })
  websites(response) {
    this.websitesByWebringResponse = response;

    const { data, error } = response;
    if (error) {
      console.log("Error getting list of Websites in Webring:", error);
    } else if (data) {
      this.websiteList = data;
    }
  }

  @wire(getRecord, { recordId: "$webringId", fields: [WEBRING_NAME] })
  webringNameResponse;

  get cardTitle() {
    return `Websites in your webring, ${getFieldValue(
      this.webringNameResponse.data,
      WEBRING_NAME
    )}`;
  }

  get emptyWebsiteList() {
    return !this.websiteList || this.websiteList.length === 0;
  }

  @wire(MessageContext)
  messageContext;

  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(this.messageContext, WEBSITE_ADDED, () => {
        refreshApex(this.websitesByWebringResponse);
      });
    }
  }

  unsubscribeToMessageChannel() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  handleUpdate(event) {
    const fields = {};
    fields[WEBSITE_ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
    fields[WEBSITE_URL_FIELD.fieldApiName] = event.detail.draftValues[0].URL__c;
    fields[WEBSITE_NAME_FIELD.fieldApiName] = event.detail.draftValues[0].Name;

    const recordInput = { fields };

    updateRecord(recordInput)
      .then(() => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: "Website updated",
            variant: "success"
          })
        );
        // Display fresh data in the datatable
        return refreshApex(this.websitesByWebringResponse).then(() => {
          // Clear all draft values in the datatable
          this.draftValues = [];
        });
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error updating or reloading record",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  }

  handleRowAction(event) {
    const action = event.detail.action;
    const recordId = event.detail.row.Id;

    switch (action.name) {
      case "delete":
        deleteRecord(recordId)
          .then(() => {
            refreshApex(this.websitesByWebringResponse);
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Website deleted",
                variant: "success"
              })
            );
          })
          .catch((error) => {
            console.error(error);
            this.dispatchEvent(
              new ShowToastEvent({
                title: "Error deleting website",
                message: error.body.message,
                variant: "error"
              })
            );
          });
        break;
      default:
        break;
    }
  }
}
