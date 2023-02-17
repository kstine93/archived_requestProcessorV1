# Explanation of input systems
This file gives an overview of the inputs (i.e., data deletion requests) that this data-deletion-service application is expected to process. Namely, there are 2 types:
* **push** inputs (deletion requests which are *given* to this application from an outside process - e.g., a webhook sends a notification, a human user uploads an email address)
* **pull** inputs (deletion requests which are *requested* by this application - e.g., querying Zalando's databases to find 'right to be forgotten' requests from Customer Care (CuCa)).

By design, this application is a passive receiver of any **push** inputs - in other words *it cannot determine if these push methods failed*. So if a webhook stops firing or human users stop logging requests, then this application will not raise any warnings.
This could potentially be changed in the future to some extent - by changing some of our notification systems to be **pull** instead of **push** (e.g., for QuestionPro in Spring 2022, there is no API call yet to look for unsubscribed or deleted members - we have to rely on their webhook system instead).

For a full list of inputs, see this document maintained by the Voice of Customers team:
<https://docs.google.com/document/d/1FetddvtYtfVPoFP-HFL4oMLI24YhWI5d4deNvDp7Zow/edit?usp=sharing>