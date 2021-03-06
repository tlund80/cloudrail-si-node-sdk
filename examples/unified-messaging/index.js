const express = require('express')
const cr = require("cloudrail-si")
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.raw( {inflate:true, limit:'100mb', type:'*/*'} ))
const port = 8080
const stream = require('stream')
const fs = require('fs')

cr.Settings.setKey("[Your CloudRail Key]")

var service
var serviceString = process.argv[2]
switch (serviceString) {
	case "line":
		service = new cr.services.Line(null, "[Bot Token]")
		break
	case "facebook":
		service = new cr.services.FacebookMessenger(null, "[Bot Token]")
		break
	case "telegram":
    service = new cr.services.Telegram(null, "[Bot Token]", "[Webhook URL]")
		break
	case "viber":
		service = new cr.services.Viber(null, "[Bot Token]", "[Webhook URL]", "[Bot Name]")
		break
}

app.post('/', (request, response) => {
	console.log("received message")

	var bodyStream = new stream.Readable()
	bodyStream.push(request.body)
  bodyStream.push(null)
  
	service.parseReceivedMessages(bodyStream, (err, messages) => {
		if (err) {
			console.log("error in parseReceivedMessages")
			throw(err)
		} else {
		  messages.forEach(function(message) {
        handleMessage(message)
      })
    }
  })
	response.send('Hello World!')
})

function handleMessage(message) {
  var chat = message.chatId
  if (message.attachments != null && message.attachments.length > 0) {
    service.sendMessage(chat, "You send a message with attachment.", (err, message) => {
      if (err) {
        console.log("error in sendMessage")
        throw(err)
      }
    });
  } else if ((message.messageText) != null && (message.messageText.trim().toLowerCase() == "send a photo")) {
    service.sendImage(
      chat,
      "here's an image", "https://webhooks.cloudrail.com/home/ubuntu/server/media/cr_logo.jpg", null, null, null, (err, message) => {
        if (err) {
          console.log("error in sendImage")
          throw(err)
        }
      })
  } else if ((message.messageText) != null && (message.messageText.trim().toLowerCase() == "send a video")) {
    service.sendVideo(
      chat, "here's a video", "https://webhooks.cloudrail.com/home/ubuntu/server/media/SmallVideo.mp4", null, null, null, null, null, (err, message) => {
        if (err) {
          console.log("error in sendVideo")
          throw(err)
        }
      })
  } else if ((message.messageText) != null && (message.messageText.trim().toLowerCase() == "send a file")) {
    service.sendFile(
      chat, "here's a generic file", "https://webhooks.cloudrail.com/home/ubuntu/server/media/cr.pdf", null, null, null, null, null, (err, message) => {
      if (err) {
        console.log("error in sendFile")
        throw(err)
      }
    })
  } else if ((message.messageText) != null && (message.messageText.trim().toLowerCase() == "give me a choice")) {
    var buttons1 = []
    var buttons2 = []
    buttons1.push(new cr.types.MessageButton("Yay!", "postback", null, "Yay!"))
    buttons1.push(new cr.types.MessageButton("That's cool!", "postback", null, "That's cool!"))
    buttons2.push(new cr.types.MessageButton("Nay!", "postback", null, "Nay!"))
    buttons2.push(new cr.types.MessageButton("Why would I do that?", "postback", null, "Why would I do that?"))

    var mItems = []
    mItems.push(new cr.types.MessageItem("CloudRail", "Implement all services with one common code", "https://webhooks.cloudrail.com/home/ubuntu/server/media/cr_logo.jpg", buttons1))
    mItems.push(new cr.types.MessageItem("REST APIs", "Bother with a different API for every service", "https://webhooks.cloudrail.com/home/ubuntu/server/media/code.jpg", buttons2))

    service.sendCarousel(chat, mItems)
  } else {
    service.sendMessage(chat, "You send a message at " + message.sendAt + " with ID " + message.messageId + " and content " + message.messageText, (err, message) => {
        if (err) {
          console.log("error in sendMessage")
          throw(err)
        }
      });
  }
}

app.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log('server is listening on ' + port)
})