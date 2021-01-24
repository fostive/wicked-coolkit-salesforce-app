public with sharing class WebringController {
  @AuraEnabled(cacheable=true)
  public static List<Webring__c> getWebrings() {
    return [SELECT Id, Name FROM Webring__c];
  }
}
