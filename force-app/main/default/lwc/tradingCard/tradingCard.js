import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { subscribe, MessageContext } from "lightning/messageService";
import getPicturePath from "@salesforce/apex/AttachmentController.getPicturePath";
import PICTURE_UPDATED_CHANNEL from "@salesforce/messageChannel/Picture_Updated__c";

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
  CODEPEN_FIELD
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
  CODEPEN_FIELD
];

export const FORM_FIELDS = [
  NAME_FIELD,
  GITHUB_FIELD,
  BIO_FIELD,
  TWITTER_FIELD,
  LINKEDIN_FIELD,
  MAIN_WEBSITE_FIELD,
  INSTAGRAM_FIELD,
  CODEPEN_FIELD,
  STRENGTHS_FIELD
];

export default class TradingCard extends LightningElement {
  @api recordId;

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

  error = null;
  loading = true;
  subscription = {};

  @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
  card({ error, data }) {
    if (data) {
      this.displayName = getFieldValue(data, NAME_FIELD);
      this.description = getFieldValue(data, BIO_FIELD);
      this.imgSrc = getFieldValue(data, PICTURE_PATH_FIELD);
      this.link = getFieldValue(data, MAIN_WEBSITE_FIELD);
      this.setStrengths(getFieldValue(data, STRENGTHS_FIELD));

      // links
      this.setEmail(getFieldValue(data, EMAIL_FIELD));
      this.setTwitter(getFieldValue(data, TWITTER_FIELD));
      this.setGitHub(getFieldValue(data, GITHUB_FIELD));
      this.setLinkedIn(getFieldValue(data, LINKEDIN_FIELD));
      this.setInstagram(getFieldValue(data, INSTAGRAM_FIELD));
      this.setCodePen(getFieldValue(data, CODEPEN_FIELD));
    } else {
      this.error = error;
    }
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

  _stickers = [];
  get stickers() {
    return this._stickers.map((sticker) => ({
      id: sticker.id,
      href: `${host.api(this.host)}/sticker/?id=${sticker.id}`,
      imgSrc: host.sticker(sticker.path),
      imgAlt: sticker.alt
    }));
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
    this.subscription = subscribe(
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
  }
}
