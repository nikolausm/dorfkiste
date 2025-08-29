# Claude Code Configuration - SPARC Development

## 🚨 CRITICAL: CONCURRENT EXECUTION RULES

**GOLDEN RULE**: ALL operations MUST be concurrent/parallel in ONE message
- TodoWrite: Batch ALL todos (5-10+) in ONE call
- Task tool: Spawn ALL agents in ONE message
- File operations: Batch ALL reads/writes/edits
- Bash commands: Execute ALL commands together
- Memory: Batch ALL store/retrieve operations

## 🎯 Execution Separation

**Claude Code Handles ALL Real Work:**
- File operations (Read, Write, Edit, Glob, Grep)
- Code generation and implementation
- Bash commands and system operations
- Git operations and package management
- Testing, debugging, and validation

**MCP Tools ONLY Coordinate:**
- Planning and orchestration
- Memory management
- Performance tracking
- Never execute or create files

## SPARC Development Commands

### Core Commands
```bash
npx claude-flow sparc run <mode> "<task>"    # Execute SPARC mode
npx claude-flow sparc tdd "<feature>"        # Full TDD workflow
npx claude-flow sparc batch <modes> "<task>" # Parallel execution
```

### Build Commands
```bash
npm run build     # Build project
npm run test      # Run tests
npm run lint      # Linting
npm run typecheck # Type checking
```

## 📋 Available Agents (54 Total)

### Core Development
- `coder`, `reviewer`, `tester`, `planner`, `researcher`

### Swarm Coordination
- `hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`
- `collective-intelligence-coordinator`, `swarm-memory-manager`

### Specialized
- `backend-dev`, `mobile-dev`, `ml-developer`, `cicd-engineer`
- `system-architect`, `api-docs`, `code-analyzer`

### GitHub Integration
- `github-modes`, `pr-manager`, `code-review-swarm`
- `issue-tracker`, `release-manager`, `workflow-automation`

## 🎯 Agent Deployment Pattern

```javascript
// ✅ CORRECT: Concurrent deployment
[Single Message]:
  Task("Research agent", "full instructions", "researcher")
  Task("Coder agent", "full instructions", "coder")
  Task("Tester agent", "full instructions", "tester")
  TodoWrite { todos: [10+ todos with priorities] }
  Read("file1.js")
  Write("output.js", content)
  Bash("npm test")
```

## 📊 Performance Benchmarks
- File Operations: 300% faster with parallel processing
- Code Analysis: 250% improvement
- Test Generation: 400% faster
- Documentation: 200% improvement

## MCP Tools Reference

### Coordination
- `mcp__claude-flow__swarm_init` - Initialize swarm topology
- `mcp__claude-flow__agent_spawn` - Create cognitive patterns
- `mcp__claude-flow__task_orchestrate` - Coordinate workflows

### Monitoring
- `mcp__claude-flow__swarm_status` - Track effectiveness
- `mcp__claude-flow__agent_metrics` - Performance metrics

### Memory & Neural
- `mcp__claude-flow__memory_usage` - Persistent memory
- `mcp__claude-flow__neural_train` - Pattern improvement

## Best Practices

✅ DO:
- Batch all related operations
- Use parallel execution always
- Store decisions in memory
- Monitor with status tools

❌ DON'T:
- Execute operations sequentially
- Split TodoWrite calls
- Use MCP for file operations
- Spawn agents one by one

## Quick Setup

```bash
# Add MCP server (stdio - no port needed)
claude mcp add claude-flow npx claude-flow@alpha mcp start
```

Remember: **Claude Flow coordinates, Claude Code creates!**