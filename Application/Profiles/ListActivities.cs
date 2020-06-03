using System;
using System.Linq;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ListActivities
    {
        public class Query : IRequest<List<UserActivityDto>>
        {
            public string Username { get; set; }
            public string Predicate { get; set; }
        }

        public class Handler : IRequestHandler<Query, List<UserActivityDto>>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                this._context = context;
            }

            public async Task<List<UserActivityDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = await this._context.Users.SingleOrDefaultAsync(x=>x.UserName == request.Username);
                if(user == null)
                {
                    throw new RestException(HttpStatusCode.NotFound, new { User= "Not found"});
                }
                
                var queryable = user.UserActivities.AsQueryable();  
                switch(request.Predicate)
                {
                    case "past":
                        queryable = queryable.Where(a=>a.Activity.Date <= DateTime.Now);
                        break;
                    case "hosting":
                        queryable = queryable.Where(a=>a.IsHost);
                        break;
                    default:
                        queryable = queryable.Where(x=>x.Activity.Date >= DateTime.Now);
                        break;
                }
                var activities = queryable.ToList();
                var activitiesToReturn =  new List<UserActivityDto>();
                foreach(var activity in activities)
                {
                        var userActivity = new UserActivityDto
                        {
                            Id = activity.Activity.Id,
                            Category = activity.Activity.Category,
                            Date = activity.Activity.Date,
                            Title = activity.Activity.Title
                        };
                        activitiesToReturn.Add(userActivity);
                }

                return activitiesToReturn;
            }
        }

    }
}