import readline from "readline";

const {ethers} = require("hardhat");

import contractABI from "../artifacts/contracts/JoystickAI.sol/JoystickAIHelp.json"

//CA 0x02cEf89dfd0d2Cc33AAe154d28D237F26B53CF5e

async function main() {


    if (!process.env.JOYSTICK_CA) {
        throw new Error("JOYSTICK_CA env variable is not set.");
      }
    
      const contractAddress = process.env.JOYSTICK_CA;
      const [signer] = await ethers.getSigners();
    
      // Create a contract instance
      const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
    
      // The content of the image you want to generate
      let message = await getUserInput();

      // Call the startChat function
    let transactionResponse = await contract.initializeDalleCall(message);
    let receipt = await transactionResponse.wait();
    console.log(`Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`)
    console.log(`Image generation started with message: "${message}"`);

    // loop and sleep by 1000ms, and keep printing `lastResponse` in the contract.
    let lastResponse = await contract.lastResponse();
    let newResponse = lastResponse;

    // print w/o newline
    console.log("Waiting for response: ");
    while (newResponse === lastResponse) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        newResponse = await contract.lastResponse();
        console.log(".");
    }

    console.log(`Image generation completed, image URL: ${newResponse}`)

    //Bot
    message = await getUserInput()

    // Call the sendMessage function
    transactionResponse = await contract.sendMessage(message)
    receipt = await transactionResponse.wait()
    console.log(`Message sent, tx hash: ${receipt.hash}`)
    console.log(`Chat started with message: "${message}"`)

    // Read the LLM response on-chain
    while (true) {
        const response = await contract.response();
        if (response) {
        console.log("Response from contract:", response);
        break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
    }
}


async function getUserInput(): Promise<string | undefined> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  
    const question = (query: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(query, (answer) => {
          resolve(answer)
        })
      })
    }
  
    try {
      const input = await question("Enter an image description: ")
      rl.close()
      return input
    } catch (err) {
      console.error('Error getting user input:', err)
      rl.close()
    }
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });