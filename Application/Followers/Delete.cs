using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers
{
    public class Delete
    {
        public class Command : IRequest
        {
            public string Username { get; set; }        
        }

        public class Hanlder : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;

            public Hanlder(DataContext context, IUserAccessor userAccessor)
            {
                this._userAccessor = userAccessor;
                this._context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                
                var observer = await this._context.Users.SingleOrDefaultAsync(x=> x.UserName == this._userAccessor.GetCurrentUsername());
                var target = await this._context.Users.SingleOrDefaultAsync(x=> x.UserName == request.Username);

                if(target == null)
                {
                    throw new RestException(HttpStatusCode.NotFound, new { User = "Not found"});                    
                }

                var following = await this._context.Followers
                    .SingleOrDefaultAsync(x=> x.ObserverId == observer.Id && x.TargetId == target.Id );

                if(following == null)
                {
                    throw new RestException(HttpStatusCode.BadRequest, new { User = "You are not following this user."});     
                }
               
                this._context.Followings.Remove(following);

                var success =await this._context.SaveChangesAsync() > 0;
                if (success)
                {
                    return Unit.Value;
                }

                throw new Exception("Problem saving changes");

            }
        }
    }
}