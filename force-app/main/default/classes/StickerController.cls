public with sharing class StickerController {
  public class CSVImportException extends Exception {
  }

  @AuraEnabled
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

  @AuraEnabled
  public static void importStickers() {
    // Note: %5E is the ^ character. Salesforce doesn't allow it unencoded in a path
    String stickersCsvUrl = 'https://unpkg.com/wicked-coolkit@%5E1.0.1/dist/stickers/stickers.csv';

    HttpRequest req = new HttpRequest();
    req.setEndpoint(stickersCsvUrl);
    req.setMethod('GET');

    System.Debug(req.getEndpoint());

    Http http = new Http();
    HTTPResponse res = http.send(req);

    // Handle 302 redirects
    while (res.getStatusCode() == 302) {
      String newUrl = res.getHeader('Location');

      // Handle Location response header without protocol and host
      if (newUrl.startsWith('/')) {
        newUrl = 'https://' + (new URL(req.getEndpoint())).getHost() + newUrl;
      }

      req.setEndpoint(newUrl);
      res = new Http().send(req);
    }

    String csvResponseBody = res.getBody();

    try {
      List<Sticker__c> stickerList = new List<Sticker__c>();
      String[] csvLines = csvResponseBody.split('\n');

      // NOTE: does not work if field value contains comma
      for (Integer i = 1; i < csvLines.size(); i++) {
        Sticker__c stickerObj = new Sticker__c();
        String[] csvRecordData = csvLines[i].split(',');
        stickerObj.Image_Alt_Text__c = dequote(csvRecordData[0]);
        stickerObj.Name = dequote(csvRecordData[1]);
        stickerList.add(stickerObj);
      }

      if (stickerList.size() > 0) {
        insert stickerList;
      }
    } catch (Exception e) {
      throw new CSVImportException(e.getMessage(), e);
    }
  }

  private static String dequote(String str) {
    return str.removeStart('"').removeEnd('"');
  }
}
