import { LightningElement, wire, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { publish, MessageContext } from "lightning/messageService";
import PICTURE_UPDATED_CHANNEL from "@salesforce/messageChannel/Picture_Updated__c";
import PICTURE_FIELD from "@salesforce/schema/Card__c.Picture__c";
import updatePicturePath from "@salesforce/apex/AttachmentController.updatePicturePath";
import getPicturePath from "@salesforce/apex/AttachmentController.getPicturePath";

export default class FileUploader extends LightningElement {
  @api
  recordId;
  picturePath;

  @wire(MessageContext)
  messageContext;

  get fields() {
    return [PICTURE_FIELD];
  }

  get acceptedFormats() {
    return [".jpg", ".jpeg", ".png"];
  }

  handleUploadFinished() {
    updatePicturePath({ recordId: this.recordId })
      .then(() => {
        const toastEvt = new ShowToastEvent({
          title: "Picture Updated",
          message: "Your picture has been updated",
          variant: "success"
        });
        this.dispatchEvent(toastEvt);
        publish(this.messageContext, PICTURE_UPDATED_CHANNEL, {
          recordId: this.recordId
        });
        this.loadPicture();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  connectedCallback() {
    this.loadPicture();
  }

  loadPicture() {
    getPicturePath({ recordId: this.recordId })
      .then((path) => {
        console.log(path);
        this.picturePath = path;
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
