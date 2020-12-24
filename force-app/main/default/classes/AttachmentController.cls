public  class AttachmentController { 
    @AuraEnabled
    public static void updatePicturePath(String recId){  
        //In lighting, the attachments are stored in content documents
        ContentDocumentLink docLink = [ SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recId order by Id desc LIMIT 1]; 
        //ContentVersion Id uniquely identifies the attachment
        ContentVersion version = [SELECT Id FROM ContentVersion WHERE ContentDocumentId = :docLink.ContentDocumentId]; 
        //Update the Picture_Path field with the url of the image
        Contact contact = [SELECT Id FROM Contact WHERE Id =:recId];
        contact.Picture_Path__c = '/sfc/servlet.shepherd/version/download/' + version.Id; 
        upsert contact;        
    }
}