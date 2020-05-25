using System.Security.Claims;
using System.Linq;
using System.Threading.Tasks;
using Application.Comments;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class ChatHub : Hub
    {
        private readonly IMediator _mediator;
        public ChatHub(IMediator mediator)
        {
            this._mediator = mediator;
        }

        public async Task SendComment(Create.Command command)
        {
            var username = GetUserName();
            command.Username = username;
            var comment = await this._mediator.Send(command);
            await Clients.Group(command.ActivityId.ToString()).SendAsync("ReceiveComment", comment);
        }

        private string GetUserName()
        {
            return Context.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        public async Task AddToGroup(string groupName)
        {
            var username = GetUserName();
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("Send", $"{username} has joined the group");
        }

            public async Task RemoveFromGroup(string groupName)
        {
            var username = GetUserName();
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("Send", $"{username} has left the group");

        }
    }
}