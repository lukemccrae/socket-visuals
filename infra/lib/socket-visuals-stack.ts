import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { type Construct } from 'constructs';
export class SocketVisualsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'WS-API',
      schema: appsync.SchemaFile.fromAsset('infra/graphql/schema.graphql'),
      authorizationConfig: {
        // defaultAuthorization: {
        //   authorizationType: AuthorizationType.API_KEY
        // }
      }
    });
    // Attach the policy to your role
    const subscriptionLambdaRole = new iam.Role(
      this,
      'SubscriptionLambdaExecutionRole',
      {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
      }
    );

    const mutationLambdaRole = new iam.Role(
      this,
      'MutationLambdaExecutionRole',
      {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
      }
    );

    const cloudWatchLogsPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ],
          resources: ['*'] // Adjust this to limit resources as needed
        })
      ]
    });

    const cloudwatchPolicy = new iam.Policy(this, 'CloudWatchLogsPolicy', {
      document: cloudWatchLogsPolicy
    });

    subscriptionLambdaRole.attachInlinePolicy(cloudwatchPolicy);
    mutationLambdaRole.attachInlinePolicy(cloudwatchPolicy);

    // Define a Lambda function for handling subscriptions
    const subscriptionLambda = new lambda.Function(this, 'subscriptionLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambdas/subscriptionLambda/dist'),
      role: subscriptionLambdaRole
    });

    // Define a Lambda function for handling mutation
    const mutationLambda = new lambda.Function(this, 'mutationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambdas/mutationLambda/dist'),
      role: mutationLambdaRole
    });

    const mutationDataSource = api.addLambdaDataSource(
      'MutationDataSource',
      mutationLambda
    );

    const subscriptionDataSource = api.addLambdaDataSource(
      'SubscriptionDataSource',
      subscriptionLambda
    );

    subscriptionDataSource.createResolver('subscribe2channel', {
      typeName: 'Subscription',
      fieldName: 'subscribe2channel'
    });

    mutationDataSource.createResolver('publish2channel', {
      typeName: 'Mutation',
      fieldName: 'publish2channel'
    });
  }
}
