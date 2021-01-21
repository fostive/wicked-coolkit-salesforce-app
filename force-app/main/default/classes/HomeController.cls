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
  public static List<Sticker__c> getStickersByCard(Id cardId) {
    return [
      SELECT Id, Name, Image_Alt_Text__c
      FROM Sticker__c
      WHERE
        Id IN (
          SELECT Sticker__c
          FROM Card_Sticker_Association__c
          WHERE Card__c = :cardId
        )
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
