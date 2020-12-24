({
    handleUploadFinished : function(component, event, helper) {        
        // Get the list of uploaded files
        var uploadedFiles = event.getParam('files'); 
        //set action to call updatePicturePath method from Server-side controller
        var action = component.get('c.updatePicturePath');
        //set parametrs
        action.setParams({
            recId : component.get('v.recordId')
        }); 
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state === 'SUCCESS' || state === 'DRAFT') {
                var resultToast = $A.get("e.force:showTest");
                resultToast.setParams({
                    "title" : "Success!",
                    "message" : uploadedFiles.length + "file uploadedsuccessfully!"
                });
                resultToast.fire();;
            }
        });
        $A.enqueueAction(action);
    }
})