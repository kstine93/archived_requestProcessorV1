# Explanation of output files
This file gives an overview of the output files in this repository - for readers to use in understanding existing output types and adding/removing types.

## output-defs.json
This file gives definitions of the different data removal steps which need to be taken by the data deletion service.
* "desc" - gives human-readable description of this deletion step.
* "id" - gives machine-readable way to identify this output step (necessary for listing which output steps necessary for a given input step)
* "outputType" - tells the code how to process this deletion step, can take these possible values:
    * emailNotification
    * httpRequest
* "doLast" - tells the code if the system being deleted from in this step should be deleted from last or not (typically because this data source is the main 'source of truth' of data - rather than a auxiliary system. Deletion from these core system(s) is often the least reversible if errors occur).
* "parameters" - gives necessary data to subfunctions to process the deletion step. If this is an http request, gives the URL and headers. If this is an email notification, gives a reference to the message to send.


```
        {
            "desc":"Search and remove Google Drive files",
            "outputType":"emailNotification",
            "doLast":false,
            "parameters":{
                "outputEmailFile":"removeDriveData.html"
            }
        }
```

## messages
This folder houses the html messages to be sent as part of processing some deletion requests.