# Application Store Submission Guide
Welcome developers to the [LCMD MicroServer App Store](https://appstore.lazycat.cloud/#/shop)! To ensure users receive high-quality and stable application experiences while maintaining a good ecosystem for the app store, we have established this application submission guide. Please carefully read and follow the following rules before submitting your application.

#### 1. Application Information Completeness
When submitting an application, be sure to ensure that the application's logo, name, description, and screenshots are complete and accurate. This information is the first window for users to understand the application and is also an important basis for our application review. Among them, application name, description and usage instructions should support multiple languages, configure locales to achieve localization, and the language key specifications that support settings can refer to the [BCP 47 standard](https://en.wikipedia.org/wiki/IETF_language_tag).

[View Localized Application Configuration Example](./spec/manifest.md#i18n)

#### 2. Installability and Loadability
Applications must have good installation and loading performance. If issues such as inability to install, inability to load after installation, or no response after loading occur, the application will not pass review for listing. Before submission, please comprehensively test the application's installation process and initial loading functionality, paying special attention to checking whether the dependencies required for application installation can be accessed normally.

#### 3. Application Quality Stability
Serious crashes and flashback phenomena should be avoided.

#### 4. Speed Indicators
The application's startup speed, response time, etc. should not exceed 5 minutes.

#### 5. Special Scenario Adaptability
-  **Hardware Integration Applications**

For applications that need to be used with hardware, comprehensive testing must be conducted in a real hardware environment before submission to ensure that all interaction functions between the application and hardware can be implemented normally. Please provide test instructions including hardware model information.

-  **Special Scenario Applications**

Applications restricted to certain special scenarios (such as browsers, etc.) need to be fully tested in the corresponding scenarios to ensure all functions can be used normally.

-  **Update Prompt Reasonableness**

Update prompts within the application should not seriously affect its normal use. If update prompts interfere with the normal operation of the application, developers need to handle them reasonably. If the application cannot complete in-app updates, it is recommended to remove the update prompt.

#### 6. Application Scenario Effectiveness
Submitted applications must have real and effective application scenarios for users. Development libraries and middleware software forms are not allowed to be listed in principle; tool applications need to be associated with corresponding file types in Lazycat cloud storage.

#### 7. Application Data Persistence
For applications that need persistent data, it is necessary to test whether the data can be persisted normally, restart the application or upgrade the application to ensure data is not lost; for already listed applications, do not easily make instance changes during upgrades, as instance changes will cause storage path changes. If instance changes are needed, proper data migration and recovery work should be done.

We hope all developers can strictly follow the above submission guidelines and submit high-quality applications. We believe that through joint efforts, the LCMD MicroServer App Store will provide users with a rich, high-quality, and secure application ecosystem. If you have any questions or need further help, please feel free to contact the [LCMD MicroServer App Store Official Support Team](https://lazycat.cloud/about?navtype=AfterSalesService).

See how to [publish applications](./publish-app.md).