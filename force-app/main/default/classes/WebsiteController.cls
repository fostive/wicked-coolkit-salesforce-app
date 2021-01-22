public with sharing class WebsiteController {
  @AuraEnabled(cacheable=true)
  public static List<Website__c> getWebsitesByWebring(Id webringId) {
    return [
      SELECT Id, Name, URL__c, Webring__c
      FROM Website__c
      WHERE Webring__c = :webringId
    ];
  }
}
