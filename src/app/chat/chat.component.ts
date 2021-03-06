import { TokenService } from './../token.service';
import { ApiService } from './../api.service';
import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';

declare global {
  interface Window { Twilio: any; }
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: []
})
export class ChatComponent implements OnInit {

  channel;
  channelName;
  messageList = [];
  composedMessage: string;
  username: string;
  finishedLoading: boolean = false;



  constructor(private apiService: ApiService, private tokenService: TokenService) {
    const params = (new URL(document.location.href)).searchParams;

    const _this = this;

    _this.channelName = (params.get('channelName'));

    console.log(_this.channelName);

    _this.tokenService.getTokenInfo().subscribe(
      (response) => {
        const token = response.token;
      _this.username = response.identity;
      _this.tokenService.token = response.token;
      _this.tokenService.identity = response.identity;
      window.Twilio.Chat.Client.create(token).then(client => {
        client.getSubscribedChannels().then(channels => {
          client.getChannelByUniqueName(_this.channelName).then(channel => {
            _this.channel = channel;
            _this.joinChannel().then(() => {
              _this.listenForNewMessages();
              _this.finishedLoading = true;
            });
          });
        });
      });
      }
    );




  }

  joinChannel() {
    return this.channel.join().then(joined => {
      console.log('joined!', joined);
    }).catch(err => {
      console.warn('didn\'t join because', err);
    });
  }

  listenForNewMessages() {
    const _this = this;
    _this.channel.on('messageAdded', message => {
      _this.messageList.push(message);
      _this.scrollMessagesUp();
    });
  }

  sendMessage() {
    const _this = this;
    _this.channel.sendMessage(_this.composedMessage);
    _this.composedMessage = '';
    this.scrollMessagesUp();
  }

  scrollMessagesUp() {
    setTimeout(()=>{
      window.scrollTo(0,document.body.scrollHeight);
    }, 0);
  }

  ngOnInit() {
  }

}
