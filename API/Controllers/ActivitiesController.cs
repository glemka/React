using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Activities;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers {

    public class ActivitiesController : BaseController 
    {
        [HttpGet]
        public async Task<ActionResult<List<ActivityDto>>> List(){
            return await this.Mediator.Send(new List.Query());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ActivityDto>> Get(Guid id)
        {
            return await this.Mediator.Send(new Details.Query()
            {
                Id = id
            });
        }

        [HttpPost]
        public async Task<ActionResult<Unit>> Create(Create.Command command)
        {
            return await this.Mediator.Send(command);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Unit>> Delete(Guid id)
        {
            return await this.Mediator.Send(new Delete.Command{ Id = id});
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Unit>> Edit(Edit.Command command)
        {
            return await this.Mediator.Send(command);
        }
    }
}