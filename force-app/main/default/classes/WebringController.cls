public with sharing class WebringController {
  @AuraEnabled(cacheable=true)
  public static List<Webring__c> getWebring() {
    return [SELECT Id FROM Webring__c LIMIT 1];
  }
}
