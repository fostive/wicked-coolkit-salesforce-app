import { LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { FORM_FIELDS } from "c/tradingCard";
import getCard from "@salesforce/apex/HomeController.getCard";

export default class Home extends LightningElement {
  recordId;
  fields = FORM_FIELDS;
  mode = "edit";
  isNew = true;

  @wire(getCard)
  card({ data, error }) {
    if (data) {
      this.recordId = data.Id;
      this.mode = "view";
      this.isNew = false;
    } else {
      console.log(error);
    }
  }

  handleSuccess(event) {
    const recordId = event.detail.id;

    const toastEvt = new ShowToastEvent({
      title: `Card ${this.isNew ? "created" : "updated"}`,
      message: `Your trading card has been ${
        this.isNew ? "created" : "updated"
      }`,
      variant: "success"
    });
    this.dispatchEvent(toastEvt);

    this.isNew = false;
    this.recordId = recordId;
  }
}
