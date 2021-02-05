import { LightningElement, api, track, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import STICKER_UPDATED_CHANNEL from "@salesforce/messageChannel/Sticker_Updated__c";
import addSticker from "@salesforce/apex/StickerController.addSticker";
import deleteSticker from "@salesforce/apex/StickerController.deleteSticker";
import getStickers from "@salesforce/apex/StickerController.getStickers";
import getStickersByCard from "@salesforce/apex/StickerController.getStickersByCard";
import importStickers from "@salesforce/apex/StickerController.importStickers";

import { host } from "c/tradingCard";

export default class StickersForm extends LightningElement {
  importButtonDisabled;

  @api
  recordId;

  @wire(MessageContext)
  messageContext;

  @track
  stickers = [];

  MAX_STICKERS = 12;

  get maxStickers() {
    return this.MAX_STICKERS;
  }

  get selectedStickers() {
    return this.getSelectedStickers().length;
  }

  get stickersAvailable() {
    return this.stickers.length && this.stickers.length > 0;
  }

  loadStickers() {
    return getStickers().then((data) => {
      this.stickers = data.map((sticker) => ({
        id: sticker.Id,
        name: sticker.Name,
        imgSrc: host.sticker(sticker.Name),
        imgAlt: sticker.Image_Alt_Text__c,
        selected: false,
        disabled: false
      }));
    });
  }

  loadSelected() {
    return getStickersByCard({ cardId: this.recordId }).then((data) => {
      data.forEach((sticker) => {
        this.stickers.forEach((s) => {
          if (sticker.Id === s.id) {
            s.selected = true;
          }
        });
      });
    });
  }

  connectedCallback() {
    Promise.all([this.loadStickers(), this.loadSelected()]).finally(() => {
      this.disableForm();
    });
  }

  getSelectedStickers() {
    return this.stickers.filter((sticker) => sticker.selected);
  }

  onChangeSticker(event) {
    const sticker = event.target;
    const exists = this.getSelectedStickers().find((s) =>
      sticker.id.startsWith(s.id)
    );

    if (!sticker.checked && exists) {
      // Delete Sticker
      this.stickers.forEach((s) => {
        if (sticker.id.startsWith(s.id)) {
          s.selected = false;
          deleteSticker({ cardId: this.recordId, stickerId: s.id })
            .then(() => {
              console.log("Sticker deleted");
              publish(this.messageContext, STICKER_UPDATED_CHANNEL, {
                recordId: this.recordId
              });
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    } else if (sticker.checked && !exists) {
      // Add Sticker
      this.stickers.forEach((s) => {
        if (sticker.id.startsWith(s.id)) {
          s.selected = true;
          addSticker({ cardId: this.recordId, stickerId: s.id })
            .then(() => {
              console.log("Sticker added");
              publish(this.messageContext, STICKER_UPDATED_CHANNEL, {
                recordId: this.recordId
              });
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    }

    // Disable Form
    this.disableForm();
  }

  disableForm() {
    if (this.getSelectedStickers().length >= this.MAX_STICKERS) {
      this.stickers.forEach((s) => {
        if (!s.selected) {
          s.disabled = true;
        }
      });
    } else {
      this.stickers.forEach((s) => {
        s.disabled = false;
      });
    }
  }

  handleImportStickersClick() {
    this.importButtonDisabled = true;

    importStickers()
      .then(() => {
        this.connectedCallback();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.importButtonDisabled = false;
      });
  }
}
