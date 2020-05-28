using System.Threading;
using System.Linq;
using Application.Interfaces;
using AutoMapper;
using Domain;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class FollowingResolver : IValueResolver<UserActivity, AttendeeDto, bool>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccesor;
        public FollowingResolver(DataContext context, IUserAccessor userAccesor)
        {
            this._userAccesor = userAccesor;
            this._context = context;

        }
        public bool Resolve(UserActivity source, AttendeeDto destination, bool destMember, ResolutionContext context)
        {
            var currentUser = this._context.Users.SingleOrDefaultAsync(x=>x.UserName == this._userAccesor.GetCurrentUsername()).Result;
            if(currentUser.Followings.Any(x=>x.TargetId == source.AppUserId))
            {
                return true;
            }
            return false;
        }
    }
}