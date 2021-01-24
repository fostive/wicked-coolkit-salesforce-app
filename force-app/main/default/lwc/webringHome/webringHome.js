import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

import getWebrings from "@salesforce/apex/WebringController.getWebrings";
import WEBRING_OBJECT from "@salesforce/schema/Webring__c";
import WEBRING_NAME_FIELD from "@salesforce/schema/Webring__c.Name";
import WEBRING_DESCRIPTION_FIELD from "@salesforce/schema/Webring__c.Description__c";

const embedCode = `<script type="module" async src="https://unpkg.com/wicked-coolkit/dist/webring.js"></script>
<wck-webring host="lukeswickedcoolkit.herokuapp.com"></wck-webring>`;

export default class WebringHome extends LightningElement {
  loading = true;
  webringId;
  webringList;
  webringObject = WEBRING_OBJECT;
  webringFields = [WEBRING_NAME_FIELD, WEBRING_DESCRIPTION_FIELD];
  mode = "edit";
  webringsResponse;
  embedCode = embedCode;

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
