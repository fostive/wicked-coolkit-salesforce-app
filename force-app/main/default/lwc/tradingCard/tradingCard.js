import { LightningElement, api, wire, track } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { subscribe, MessageContext } from "lightning/messageService";

import userId from "@salesforce/user/Id";
import getOrgId from "@salesforce/apex/HomeController.getOrgId";
import getPicturePath from "@salesforce/apex/AttachmentController.getPicturePath";
import getStickersByCard from "@salesforce/apex/StickerController.getStickersByCard";
import PICTURE_UPDATED_CHANNEL from "@salesforce/messageChannel/Picture_Updated__c";
import STICKER_UPDATED_CHANNEL from "@salesforce/messageChannel/Sticker_Updated__c";

import * as host from "./host";

// Fields
import {
  NAME_FIELD,
  EMAIL_FIELD,
  BIO_FIELD,
  STRENGTHS_FIELD,
  PICTURE_PATH_FIELD,
  MAIN_WEBSITE_FIELD,
  GITHUB_FIELD,
  TWITTER_FIELD,
  LINKEDIN_FIELD,
  INSTAGRAM_FIELD,
  CODEPEN_FIELD,
  SHARE_CARD_FIELD
} from "./fields";

const FIELDS = [
  NAME_FIELD,
  EMAIL_FIELD,
  BIO_FIELD,
  STRENGTHS_FIELD,
  PICTURE_PATH_FIELD,
  MAIN_WEBSITE_FIELD,
  GITHUB_FIELD,
  TWITTER_FIELD,
  LINKEDIN_FIELD,
  INSTAGRAM_FIELD,
  CODEPEN_FIELD,
  SHARE_CARD_FIELD
];

const HEROKU_APP_NAME_FIELD = "User.HerokuAppName__c";

export const FORM_FIELDS = [
  NAME_FIELD,
  EMAIL_FIELD,
  BIO_FIELD,
  MAIN_WEBSITE_FIELD,
  GITHUB_FIELD,
  TWITTER_FIELD,
  LINKEDIN_FIELD,
  INSTAGRAM_FIELD,
  STRENGTHS_FIELD,
  CODEPEN_FIELD,
  SHARE_CARD_FIELD
];

export { host };

export default class TradingCard extends LightningElement {
  @api recordId;
  orgId;

  @wire(MessageContext)
  messageContext;

  displayName;
  description;
  strengths = [];
  imgSrc;
  link;
  email;
  github;
  linkedin;
  twitter;
  instagram;
  codepen;
  shareCard;

  @track
  stickers = [];

  error = null;
  loading = true;
  pictureSubscription = {};
  stickerSubscription = {};

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  card({ error, data }) {
    if (data) {
      this.displayName = getFieldValue(data, NAME_FIELD);
      this.description = getFieldValue(data, BIO_FIELD);
      this.imgSrc = getFieldValue(data, PICTURE_PATH_FIELD);
      this.link = getFieldValue(data, MAIN_WEBSITE_FIELD);
      this.shareCard = getFieldValue(data, SHARE_CARD_FIELD);
      this.setStrengths(getFieldValue(data, STRENGTHS_FIELD));

      // links
      this.setEmail(getFieldValue(data, EMAIL_FIELD));
      this.setTwitter(getFieldValue(data, TWITTER_FIELD));
      this.setGitHub(getFieldValue(data, GITHUB_FIELD));
      this.setLinkedIn(getFieldValue(data, LINKEDIN_FIELD));
      this.setInstagram(getFieldValue(data, INSTAGRAM_FIELD));
      this.setCodePen(getFieldValue(data, CODEPEN_FIELD));
      getOrgId().then((orgId) => {
        this.orgId = orgId;
        this.updateStickers(this.recordId);
      });
    } else {
      this.error = error;
    }
  }

  @wire(getRecord, {
    recordId: userId,
    fields: [HEROKU_APP_NAME_FIELD]
  })
  herokuAppNameResponse;

  get linkToTradingCard() {
    const herokuAppName = getFieldValue(
      this.herokuAppNameResponse.data,
      HEROKU_APP_NAME_FIELD
    );

    if (this.herokuAppNameResponse.error || !herokuAppName) {
      return "";
    }

    return `https://${herokuAppName}`;
  }

  setStrengths(strenghts) {
    if (strenghts) {
      this.strengths = strenghts.split(",");
    }
  }

  setEmail(email) {
    if (email) {
      this.email = `mailto:${email}`;
    }
  }

  setTwitter(twitter) {
    if (twitter) {
      this.twitter = `https://twitter.com/${twitter}`;
    }
  }

  setGitHub(github) {
    if (github) {
      this.github = `https://github.com/${github}`;
    }
  }

  setCodePen(codepen) {
    if (codepen) {
      this.codepen = `https://codepen.io/${codepen}`;
    }
  }

  setLinkedIn(linkedin) {
    if (linkedin) {
      this.linkedin = `https://www.linkedin.com/in/${linkedin}`;
    }
  }

  setInstagram(instagram) {
    if (instagram) {
      this.instagram = `https://www.instagram.com/${instagram}`;
    }
  }

  get hasLinks() {
    return (
      [
        this.email,
        this.twitter,
        this.github,
        this.linkedin,
        this.instagram,
        this.codepen
      ].filter(Boolean).length > 0
    );
  }

  connectedCallback() {
    this.error = null;
    this.loading = false;
    this.subscribeToMessageChannel();
  }

  subscribeToMessageChannel() {
    this.pictureSubscription = subscribe(
      this.messageContext,
      PICTURE_UPDATED_CHANNEL,
      (message) => {
        const { recordId } = message;
        getPicturePath({ recordId })
          .then((picturePath) => {
            this.imgSrc = picturePath;
          })
          .catch((error) => {
            console.log(error);
          });
      }
    );

    this.stickerSubscription = subscribe(
      this.messageContext,
      STICKER_UPDATED_CHANNEL,
      (message) => {
        const { recordId } = message;
        this.updateStickers(recordId);
      }
    );
  }

  mapStickers(data) {
    this.stickers = data.map((sticker) => ({
      id: sticker.Id,
      imgSrc: host.sticker(sticker.Name),
      imgAlt: sticker.Image_Alt_Text__c
    }));
  }

  updateStickers(recordId) {
    getStickersByCard({ cardId: recordId })
      .then((data) => {
        const orgId = this.orgId;
        if (this.shareCard) {
          const herokuAppName = getFieldValue(
            this.herokuAppNameResponse.data,
            HEROKU_APP_NAME_FIELD
          );
          if (this.herokuAppNameResponse.error || !herokuAppName) {
            return;
          }
          const website = `https://${herokuAppName}`;
          const webrings = data.map((sticker) => sticker.Name).join(",");
          this.callApi(host.api("/add"), { orgId, website, webrings })
            .then((json) => console.log(json))
            .catch((error) => console.log(error.message));
        } else {
          this.callApi(host.api("/delete"), { orgId })
            .then((json) => console.log(json))
            .catch((error) => console.log(error.message));
        }
        this.mapStickers(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  callApi(route, body) {
    return fetch(route, {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
      .then((response) => response.json())
      .then((json) => json);
  }
}
