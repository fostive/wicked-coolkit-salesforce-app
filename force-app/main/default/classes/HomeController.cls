public with sharing class HomeController {
  @AuraEnabled(cacheable=true)
  public static Card__c getCard() {
    return [SELECT Id FROM Card__c WITH SECURITY_ENFORCED LIMIT 1];
  }

  @AuraEnabled
  public static Id getOrgId() {
    return UserInfo.getOrganizationId();
  }
}
