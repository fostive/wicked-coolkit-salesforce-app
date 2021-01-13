public class AttachmentController {
  @AuraEnabled
  public static void updatePicturePath(String recordId) {
    //In lighting, the attachments are stored in content documents
    ContentDocumentLink docLink = [
      SELECT ContentDocumentId
      FROM ContentDocumentLink
      WHERE LinkedEntityId = :recordId
      ORDER BY Id DESC
      LIMIT 1
    ];
    //ContentVersion Id uniquely identifies the attachment
    ContentVersion version = [
      SELECT Id
      FROM ContentVersion
      WHERE ContentDocumentId = :docLink.ContentDocumentId
    ];
    //Update the Picture_Path field with the url of the image
    Card__c card = [SELECT Id FROM Card__c WHERE Id = :recordId];
    card.Picture_Path__c =
      '/sfc/servlet.shepherd/version/download/' + version.Id;
    upsert card;
  }

  @AuraEnabled
  public static string getPicturePath(String recordId) {
    //In lighting, the attachments are stored in content documents
    ContentDocumentLink docLink = [
      SELECT ContentDocumentId
      FROM ContentDocumentLink
      WHERE LinkedEntityId = :recordId
      ORDER BY Id DESC
      LIMIT 1
    ];
    //ContentVersion Id uniquely identifies the attachment
    ContentVersion version = [
      SELECT Id
      FROM ContentVersion
      WHERE ContentDocumentId = :docLink.ContentDocumentId
    ];
    Card__c card = [
      SELECT Id, Picture_Path__c
      FROM Card__c
      WHERE Id = :recordId
    ];
    return card.Picture_Path__c;
  }
}
