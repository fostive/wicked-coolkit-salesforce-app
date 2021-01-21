public with sharing class HomeController {
  @AuraEnabled(cacheable=true)
  public static Card__c getCard() {
    return [SELECT Id FROM Card__c WITH SECURITY_ENFORCED LIMIT 1];
  }

  @AuraEnabled(cacheable=true)
  public static List<Sticker__c> getStickers() {
    return [
      SELECT Id, Name, Image__c, Image_Alt_Text__c
      FROM Sticker__c
      WITH SECURITY_ENFORCED
    ];
  }

  @AuraEnabled
  public static List<Card_Sticker_Association__c> getStickersByCard(Id cardId) {
    return [
      SELECT
        Card_Sticker_Association__c.Sticker__r.Id,
        Card_Sticker_Association__c.Sticker__r.Name,
        Card_Sticker_Association__c.Sticker__r.Image_Alt_Text__c,
        Card_Sticker_Association__c.Sticker__r.Image__c
      FROM Card_Sticker_Association__c
      WHERE Card_Sticker_Association__c.Card__r.Id = :cardId
      WITH SECURITY_ENFORCED
    ];
  }

  @AuraEnabled
  public static void deleteSticker(Id cardId, Id stickerId) {
    List<Card_Sticker_Association__c> stickers = [
      SELECT Id
      FROM Card_Sticker_Association__c
      WHERE Card__c = :cardId AND Sticker__c = :stickerId
    ];

    delete stickers;
  }

  @AuraEnabled
  public static void addSticker(Id cardId, Id stickerId) {
    List<Card_Sticker_Association__c> stickers = [
      SELECT Id
      FROM Card_Sticker_Association__c
      WHERE Card__c = :cardId AND Sticker__c = :stickerId
    ];

    if (stickers.isEmpty()) {
      Card_Sticker_Association__c sticker = new Card_Sticker_Association__c(
        Card__c = cardId,
        Sticker__c = stickerId
      );
      insert sticker;
    }
  }
}
