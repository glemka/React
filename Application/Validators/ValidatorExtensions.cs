using FluentValidation;

namespace Application.Validators
{
    public static class ValidatorExtensions
    {
        public static IRuleBuilder<T, string> Password<T>(this IRuleBuilder<T, string> ruleBuilder)
        {
            var options = ruleBuilder
                .NotEmpty()
                .MinimumLength(6).WithMessage("Password must be at least 6 characters")
                .Matches("[A-Z]").WithMessage("Password must contain uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain number letter")
                .Matches("[^0-9a-zA-Z]").WithMessage("Password must contain special character");
            return options;
        }
    }
}