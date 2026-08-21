Improve the UI and ensure complete working MVP using use "npx skills add shadcn/ui" to improve UI and deliver the project

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Africa's Talking Sandbox alerts

Copy `.env.example` to `.env`, then add an API key generated in the Africa's Talking Sandbox dashboard and the phone numbers registered in its simulator. 

```sh
AFRICASTALKING_SANDBOX_API_KEY=atsk_8d6fe6ef759374d84c3f51e735b4cd2201ff20416d7b1a6d5b9f15115aeb1b054e7e2dac
# Add one or more numbers registered in Africa's Talking Sandbox, comma-separated.
AFRICASTALKING_SANDBOX_RECIPIENTS=+254707172370

```
The dashboard's **Send sandbox alert** button sends the current beach risk assessment to those simulator numbers. Sandbox messages do not reach real farmer handsets.
