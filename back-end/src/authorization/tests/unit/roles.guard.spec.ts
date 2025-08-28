import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { RolesGuard } from "../../roles.guard";
import { User } from "src/users/entities/user.entity";

const mockUserModel = {
  findById: jest.fn()
}
describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;
  let jwtService: JwtService;
  let userModel: typeof mockUserModel;
  const createMockExecutionContext = (req: Partial<Request>) =>
  ({
    switchToHttp: () => ({
      getRequest: () => req,
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext);


  beforeEach(() => {
    jest.clearAllMocks();
    reflector = new Reflector();
    jwtService = new JwtService({ secret: 'secret' });
    userModel = mockUserModel;
    rolesGuard = new RolesGuard(userModel as unknown as Model<User>, reflector, jwtService);
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', async () => {
      const context = createMockExecutionContext({});
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = await rolesGuard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [context.getHandler(), context.getClass()]);
      expect(result).toBe(true);
    });

    it ('should return true if user has the required role', async () => {
      const context = createMockExecutionContext({
        headers: { authorization: 'Bearer validtoken' },
      } as unknown as Request);
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: '123' });
      userModel.findById.mockResolvedValue({ roles: ['admin'] });

      const result = await rolesGuard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1)
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [context.getHandler(), context.getClass()]);

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1)
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validtoken', { secret: 'secret' })

      expect(userModel.findById).toHaveBeenCalledTimes(1)
      expect(userModel.findById).toHaveBeenCalledWith('123')
      
      expect(result).toBe(true)
    })

    it('should return error if token not was provided', async () => {
      const context = createMockExecutionContext({})
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      
      await expect(rolesGuard.canActivate(context)).rejects.toThrow(UnauthorizedException)

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [context.getHandler(), context.getClass()]);
    });

    it('should return error if user not found', async () => {
      const context = createMockExecutionContext({
        headers: {
          authorization: 'Bearer validToken'
        }
      } as unknown as Request)
      
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: '1' });
      userModel.findById.mockResolvedValue(null)

      await expect(rolesGuard.canActivate(context)).rejects.toThrow(UnauthorizedException)

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [context.getHandler(), context.getClass()]);

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validToken', { secret: 'secret' });

      expect(userModel.findById).toHaveBeenCalledTimes(1);
      expect(userModel.findById).toHaveBeenCalledWith('1')
    })

    it('should return error if user has no roles', async () => {
      const context = createMockExecutionContext({
        headers: { authorization: 'Bearer validtoken' },
      } as unknown as Request);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({ sub: '123' });
      userModel.findById.mockResolvedValue({ roles: ['user'] });

      await expect(rolesGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [context.getHandler(), context.getClass()]);

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1)
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validtoken', { secret: 'secret' })

      expect(userModel.findById).toHaveBeenCalledTimes(1)
      expect(userModel.findById).toHaveBeenCalledWith('123')
    })

    it('should return error if token is expired', async () => {
      const context = createMockExecutionContext({
        headers: { authorization: 'Bearer validtoken' },
      } as unknown as Request);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue('TokenExpiredError: jwt expired');

      await expect(rolesGuard.canActivate(context)).rejects.toThrow(UnauthorizedException)

      expect(reflector.getAllAndOverride).toHaveBeenCalledTimes(1);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [context.getHandler(), context.getClass()]);

      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1)
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('validtoken', { secret: 'secret' })    
    })
  })

})