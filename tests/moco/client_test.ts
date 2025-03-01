import { assertEquals, assertExists } from '@std/assert';
import { assertSpyCalls, spy } from '@std/testing/mock';
import { MocoClient } from '../../src/moco/client.ts';
import { CreateMocoActivity } from '../../src/moco/types.ts';

// Mock fetch to avoid actual API calls during tests
const originalFetch = globalThis.fetch;
const mockFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  // Default mock response
  let responseBody = {};
  let status = 200;
  const url = input.toString();

  // Match different endpoints and return appropriate mock data
  if (url.includes('/projects/assigned')) {
    responseBody = [
      {
        id: 456,
        name: 'Project X',
        customer: { id: 789, name: 'Customer Y' },
        leader: { id: 321, firstname: 'John', lastname: 'Doe' },
        active: true,
      },
    ];
  } else if (url.includes('/projects/456/tasks')) {
    responseBody = [
      {
        id: 789,
        name: 'Development',
        project_id: 456,
        billable: true,
      },
    ];
  } else if (url.includes('/users')) {
    responseBody = [
      {
        id: 321,
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        active: true,
      },
    ];
  } else if (url.includes('/activities/bulk')) {
    responseBody = {
      success: true,
      activities_created: 2,
      activities: [
        {
          id: 123,
          date: '2024-02-28',
          seconds: 3600,
          description: 'Test activity 1',
          project_id: 456,
          task_id: 789,
          billable: true,
        },
        {
          id: 124,
          date: '2024-02-28',
          seconds: 1800,
          description: 'Test activity 2',
          project_id: 456,
          task_id: 789,
          billable: true,
        },
      ],
    };
  } else if (url.includes('/activities')) {
    responseBody = {
      id: 123,
      date: '2024-02-28',
      seconds: 3600,
      description: 'Test activity',
      project_id: 456,
      task_id: 789,
      billable: true,
    };
  }

  return new Response(JSON.stringify(responseBody), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

Deno.test('MocoClient - Get Assigned Projects', async () => {
  try {
    // Replace global fetch with mock
    globalThis.fetch = mockFetch;

    const client = new MocoClient('example', 'api-token');
    const fetchSpy = spy(globalThis, 'fetch');

    const projects = await client.getAssignedProjects();

    // Assert fetch was called with correct URL
    assertSpyCalls(fetchSpy, 1);
    const url = fetchSpy.calls[0].args[0].toString();
    assertEquals(url.includes('/projects/assigned?active=true'), true);

    // Assert response was processed correctly
    assertExists(projects);
    assertEquals(projects.length, 1);
    assertEquals(projects[0].id, 456);
    assertEquals(projects[0].name, 'Project X');
  } finally {
    // Restore original fetch
    globalThis.fetch = originalFetch;
  }
});

Deno.test('MocoClient - Get Tasks', async () => {
  try {
    globalThis.fetch = mockFetch;

    const client = new MocoClient('example', 'api-token');
    const fetchSpy = spy(globalThis, 'fetch');

    const tasks = await client.getTasks(456);

    // Assert fetch was called with correct URL
    assertSpyCalls(fetchSpy, 1);
    const url = fetchSpy.calls[0].args[0].toString();
    assertEquals(url.includes('/projects/456/tasks'), true);

    // Assert response was processed correctly
    assertExists(tasks);
    assertEquals(tasks.length, 1);
    assertEquals(tasks[0].id, 789);
    assertEquals(tasks[0].name, 'Development');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('MocoClient - Get Users', async () => {
  try {
    globalThis.fetch = mockFetch;

    const client = new MocoClient('example', 'api-token');
    const fetchSpy = spy(globalThis, 'fetch');

    const users = await client.getUsers();

    // Assert fetch was called with correct URL
    assertSpyCalls(fetchSpy, 1);
    const url = fetchSpy.calls[0].args[0].toString();
    assertEquals(url.includes('/users?active=false&internal=false'), true);

    // Assert response was processed correctly
    assertExists(users);
    assertEquals(users.length, 1);
    assertEquals(users[0].id, 321);
    assertEquals(users[0].firstname, 'John');
    assertEquals(users[0].lastname, 'Doe');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('MocoClient - Request method handles errors', async () => {
  try {
    // Create a mock that returns an error
    globalThis.fetch = async () => {
      return new Response('Not found', { status: 404 });
    };

    const client = new MocoClient('example', 'api-token');

    // The request should throw an error
    let error: Error | undefined;
    try {
      await client.getUsers();
    } catch (e) {
      error = e as Error;
    }

    assertExists(error);
    assertEquals(error?.message.includes('HTTP error'), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('MocoClient - Create Activity', async () => {
  try {
    globalThis.fetch = mockFetch;

    const client = new MocoClient('example', 'api-token');
    const fetchSpy = spy(globalThis, 'fetch');

    const newActivity: CreateMocoActivity = {
      date: '2024-02-28',
      seconds: 3600,
      description: 'Test activity',
      project_id: 456,
      task_id: 789,
      billable: true,
    };

    const activity = await client.createActivity(newActivity);

    // Assert fetch was called with correct URL and method
    assertSpyCalls(fetchSpy, 1);
    const call = fetchSpy.calls[0];
    const url = call.args[0].toString();
    const options = call.args[1];

    assertEquals(url.includes('/activities'), true);
    assertEquals(options?.method, 'POST');
    assertEquals(options?.body, JSON.stringify(newActivity));

    // Assert response was processed correctly
    assertExists(activity);
    assertEquals(activity.id, 123);
    assertEquals(activity.seconds, 3600);
    assertEquals(activity.description, 'Test activity');
    assertEquals(activity.project_id, 456);
    assertEquals(activity.task_id, 789);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test('MocoClient - Create Multiple Activities', async () => {
  try {
    globalThis.fetch = mockFetch;

    const client = new MocoClient('example', 'api-token');
    const fetchSpy = spy(globalThis, 'fetch');

    const newActivities: CreateMocoActivity[] = [
      {
        date: '2024-02-28',
        seconds: 3600,
        description: 'Test activity 1',
        project_id: 456,
        task_id: 789,
        billable: true,
      },
      {
        date: '2024-02-28',
        seconds: 1800,
        description: 'Test activity 2',
        project_id: 456,
        task_id: 789,
        billable: true,
      },
    ];

    const result = await client.createActivities(newActivities);

    // Assert fetch was called with correct URL and method
    assertSpyCalls(fetchSpy, 1);
    const call = fetchSpy.calls[0];
    const url = call.args[0].toString();
    const options = call.args[1];

    assertEquals(url.includes('/activities/bulk'), true);
    assertEquals(options?.method, 'POST');
    assertEquals(options?.body, JSON.stringify({ activities: newActivities }));

    // Assert response was processed correctly
    assertExists(result);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
