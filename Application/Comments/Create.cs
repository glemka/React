using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Create
    {
        public class Command : IRequest<CommentDto>
        {
            public string Body { get; set; }
            public Guid ActivityId { get; set; }
            public string Username { get; set; }
        }

        public class Hanlder : IRequestHandler<Command, CommentDto>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            public Hanlder(DataContext context, IMapper mapper)
            {
                this._mapper = mapper;
                this._context = context;
            }

            public async Task<CommentDto> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await this._context.Activities.FindAsync(request.ActivityId);

                if(activity == null)
                {
                    throw new RestException(HttpStatusCode.NotFound, new {Activity = "Not found"});
                }

                var user = await this._context.Users.FirstOrDefaultAsync(x=>x.UserName == request.Username);
            
                if(user == null)
                {
                    throw new RestException(HttpStatusCode.NotFound, new {User = "Not found"});
                }

                var comment = new Comment
                {
                    Author = user,
                    Body = request.Body,
                    Activity = activity,
                    CreatedAt = DateTime.Now
                };
                activity.Comments.Add(comment);
                
                var success = await this._context.SaveChangesAsync() > 0;
                
                if(success)
                {
                    return this._mapper.Map<CommentDto>(comment);
                }
                
                throw new Exception("Problem saving changes");
            }
        }
    }
}